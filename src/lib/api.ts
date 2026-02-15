import { ApiResponse, User, House, Task, ShoppingItem, HouseMember, HouseInvitation } from '@/types/taskmate';
import { supabase } from './supabase';

// Helper per convertire errori Supabase in ApiResponse
const handleSupabaseError = (error: any): ApiResponse => {
  console.error('Supabase Error:', error);
  return {
    success: false,
    message: error.message || 'Errore durante l\'operazione'
  };
};

export const apiCall = async (action: string, data: Record<string, unknown> = {}): Promise<ApiResponse> => {
  try {
    console.log('API Call:', action, data);

    switch (action) {
      case 'register': {
        const { name, email, password } = data;
        // Crea utente in Supabase Auth (se usi Auth) oppure solo nella tabella users
        const { data: userData, error } = await supabase
          .from('users')
          .insert({ name, email })
          .select()
          .single();

        if (error) {
          // Se utente esiste già, prova a fare login
          if (error.code === '23505') {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('email', email as string)
              .single();

            if (existingUser) {
              return {
                success: true,
                user: {
                  id: existingUser.id,
                  name: existingUser.name,
                  email: existingUser.email
                }
              };
            }
          }
          return handleSupabaseError(error);
        }

        return {
          success: true,
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email
          }
        };
      }

      case 'login': {
        const { email, password } = data;
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email as string)
          .single();

        if (error || !userData) {
          return {
            success: false,
            message: 'Credenziali non valide'
          };
        }

        return {
          success: true,
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email
          }
        };
      }

      case 'getHouses': {
        const { userId } = data;
        if (!userId) return { success: false, message: 'userId mancante' };

        // Case dove l'utente è proprietario
        const { data: ownedHouses, error: errOwned } = await supabase
          .from('houses')
          .select('*')
          .eq('owner_id', userId);

        if (errOwned) return handleSupabaseError(errOwned);

        // Case dove l'utente è membro (non proprietario)
        const { data: memberships, error: errMembers } = await supabase
          .from('house_members')
          .select('house_id')
          .eq('user_id', userId);

        if (errMembers) return handleSupabaseError(errMembers);

        const memberHouseIds = (memberships || [])
          .map((m: { house_id: string }) => m.house_id)
          .filter((id: string) => id);

        let memberHouses: Array<{ id: string; name: string; owner_id: string; owner_name: string; created_at: string }> = [];
        if (memberHouseIds.length > 0) {
          const { data: housesAsMember, error: errMemberHouses } = await supabase
            .from('houses')
            .select('*')
            .in('id', memberHouseIds);
          if (!errMemberHouses) memberHouses = housesAsMember || [];
        }

        // Unisci e deduplica per id
        const seen = new Set<string>();
        const all = [...(ownedHouses || []), ...memberHouses].filter((h) => {
          if (seen.has(h.id)) return false;
          seen.add(h.id);
          return true;
        });

        return {
          success: true,
          houses: all.map((h) => ({
            id: h.id,
            name: h.name,
            ownerId: h.owner_id,
            ownerName: h.owner_name,
            createdAt: h.created_at
          }))
        };
      }

      case 'createHouse': {
        const { name, ownerId, ownerName, ownerEmail } = data;
        
        // Validazione dati
        if (!name || !ownerId || !ownerName || !ownerEmail) {
          return {
            success: false,
            message: 'Dati mancanti per creare la casa'
          };
        }

        // Verifica che ownerId sia un UUID valido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(ownerId as string)) {
          console.error('Invalid UUID format for ownerId:', ownerId);
          return {
            success: false,
            message: 'ID utente non valido. Prova a fare logout e login di nuovo.'
          };
        }

        // Verifica che l'utente esista
        const { data: userCheck, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', ownerId as string)
          .single();

        if (userCheckError || !userCheck) {
          console.error('User not found:', userCheckError);
          return {
            success: false,
            message: 'Utente non trovato. Prova a fare logout e login di nuovo.'
          };
        }

        console.log('Creating house with data:', { name, ownerId, ownerName, ownerEmail });

        const { data: houseData, error: houseError } = await supabase
          .from('houses')
          .insert({
            name: name as string,
            owner_id: ownerId as string,
            owner_name: ownerName as string
          })
          .select()
          .single();

        if (houseError) {
          console.error('Error creating house:', houseError);
          console.error('Error details:', JSON.stringify(houseError, null, 2));
          return {
            success: false,
            message: houseError.message || `Errore durante la creazione della casa: ${JSON.stringify(houseError)}`
          };
        }

        if (!houseData) {
          return {
            success: false,
            message: 'Casa creata ma dati non restituiti'
          };
        }

        // Aggiungi il proprietario come membro
        const { error: memberError } = await supabase
          .from('house_members')
          .insert({
            house_id: houseData.id,
            user_id: ownerId as string,
            user_name: ownerName as string,
            user_email: ownerEmail as string,
            role: 'owner'
          });

        if (memberError) {
          console.error('Error adding owner as member:', memberError);
          // Non blocchiamo la creazione della casa se il membro non viene aggiunto
          // La casa è stata creata comunque
        }

        return {
          success: true,
          house: {
            id: houseData.id,
            name: houseData.name,
            ownerId: houseData.owner_id,
            ownerName: houseData.owner_name,
            createdAt: houseData.created_at
          }
        };
      }

      case 'getHouseData': {
        const { houseId } = data;
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('house_id', houseId as string)
          .order('created_at', { ascending: false });

        const { data: shopping, error: shoppingError } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('house_id', houseId as string)
          .order('created_at', { ascending: false });

        const { data: members, error: membersError } = await supabase
          .from('house_members')
          .select('*')
          .eq('house_id', houseId as string);

        if (tasksError || shoppingError || membersError) {
          return handleSupabaseError(tasksError || shoppingError || membersError);
        }

        return {
          success: true,
          tasks: (tasks || []).map(t => ({
            id: Number(t.id),
            title: t.title,
            assignee: t.assignee,
            assigneeId: t.assignee_id,
            dueDate: t.due_date,
            completed: t.completed,
            completedAt: t.completed_at ?? undefined,
            category: t.category,
            houseId: t.house_id,
            createdBy: t.created_by,
            createdById: t.created_by_id
          })),
          shopping: (shopping || []).map(s => ({
            id: Number(s.id),
            item: s.item,
            quantity: s.quantity,
            unit: s.unit ?? 'pezzi',
            checked: s.checked,
            checkedAt: s.checked_at ?? undefined,
            category: s.category ?? 'Altro',
            houseId: s.house_id,
            addedBy: s.added_by,
            addedById: s.added_by_id,
            assignee: s.assignee ?? undefined,
            assigneeId: s.assignee_id ?? undefined
          })),
          members: (members || []).map(m => ({
            id: m.id,
            houseId: m.house_id,
            userId: m.user_id,
            userName: m.user_name,
            userEmail: m.user_email,
            role: m.role,
            joinedAt: m.joined_at
          }))
        };
      }

      case 'syncHouseData': {
        const { houseId, type, data: syncData } = data;
        
        if (type === 'tasks') {
          // Elimina tutti i task della casa e ricreali
          await supabase.from('tasks').delete().eq('house_id', houseId as string);
          
          const tasksToInsert = (syncData as Task[]).map(t => ({
            title: t.title,
            assignee: t.assignee,
            assignee_id: t.assigneeId,
            due_date: t.dueDate,
            completed: t.completed,
            completed_at: t.completedAt ?? null,
            category: t.category,
            house_id: t.houseId,
            created_by: t.createdBy,
            created_by_id: t.createdById
          }));

          const { error } = await supabase.from('tasks').insert(tasksToInsert);
          if (error) return handleSupabaseError(error);
        } else if (type === 'shopping') {
          await supabase.from('shopping_items').delete().eq('house_id', houseId as string);
          
          const itemsToInsert = (syncData as ShoppingItem[]).map(s => ({
            item: s.item,
            quantity: s.quantity,
            unit: s.unit ?? 'pezzi',
            checked: s.checked,
            checked_at: s.checkedAt ?? null,
            category: s.category ?? 'Altro',
            house_id: s.houseId,
            added_by: s.addedBy,
            added_by_id: s.addedById,
            assignee: s.assignee ?? null,
            assignee_id: s.assigneeId ?? null
          }));

          const { error } = await supabase.from('shopping_items').insert(itemsToInsert);
          if (error) return handleSupabaseError(error);
        }

        return { success: true };
      }

      case 'inviteMember': {
        const { houseId, houseName, invitedEmail, invitedBy, inviterName } = data;
        const email = (invitedEmail as string)?.trim();
        if (!email) {
          return { success: false, message: 'Inserisci un indirizzo email' };
        }
        const invitedByName = (invitedBy ?? inviterName) as string;
        if (!invitedByName?.trim()) {
          return { success: false, message: 'Nome invitante mancante' };
        }
        const { data: invitation, error } = await supabase
          .from('house_invitations')
          .insert({
            house_id: houseId as string,
            house_name: (houseName as string) || 'Casa',
            invited_email: email,
            invited_by: invitedByName.trim(),
            status: 'pending'
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return { success: false, message: 'Questo utente ha già un invito in sospeso per questa casa' };
          }
          return handleSupabaseError(error);
        }

        return {
          success: true,
          message: 'Invito inviato con successo'
        };
      }

      case 'getHouseInvitations': {
        const { houseId } = data;
        const { data: invitations, error } = await supabase
          .from('house_invitations')
          .select('*')
          .eq('house_id', houseId as string)
          .order('created_at', { ascending: false });

        if (error) return handleSupabaseError(error);

        return {
          success: true,
          invitations: (invitations || []).map(inv => ({
            id: inv.id,
            houseId: inv.house_id,
            houseName: inv.house_name,
            invitedEmail: inv.invited_email,
            invitedBy: inv.invited_by,
            status: inv.status,
            createdAt: inv.created_at
          }))
        };
      }

      case 'getPendingInvitations': {
        const { email } = data;
        const { data: invitations, error } = await supabase
          .from('house_invitations')
          .select('*')
          .eq('invited_email', email as string)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) return handleSupabaseError(error);

        return {
          success: true,
          invitations: (invitations || []).map(inv => ({
            id: inv.id,
            houseId: inv.house_id,
            houseName: inv.house_name,
            invitedEmail: inv.invited_email,
            invitedBy: inv.invited_by,
            status: inv.status,
            createdAt: inv.created_at
          }))
        };
      }

      case 'acceptInvitation': {
        const { invitationId, userId, userName, userEmail } = data;
        
        // Aggiorna lo stato dell'invito
        const { data: invitation, error: invError } = await supabase
          .from('house_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitationId as string)
          .select()
          .single();

        if (invError) return handleSupabaseError(invError);

        // Aggiungi il membro alla casa
        const { error: memberError } = await supabase
          .from('house_members')
          .insert({
            house_id: invitation.house_id,
            user_id: userId as string,
            user_name: userName as string,
            user_email: userEmail as string,
            role: 'member'
          });

        if (memberError) return handleSupabaseError(memberError);

        return { success: true };
      }

      case 'rejectInvitation': {
        const { invitationId } = data;
        const { error } = await supabase
          .from('house_invitations')
          .update({ status: 'rejected' })
          .eq('id', invitationId as string);

        if (error) return handleSupabaseError(error);

        return { success: true };
      }

      case 'cancelInvitation': {
        const { invitationId } = data;
        const { error } = await supabase
          .from('house_invitations')
          .delete()
          .eq('id', invitationId as string);

        if (error) return handleSupabaseError(error);

        return { success: true };
      }

      case 'removeMember': {
        const { houseId, memberId, requestedByUserId } = data;
        if (!houseId || !memberId || !requestedByUserId) {
          return { success: false, message: 'Dati mancanti per rimuovere il membro' };
        }

        // Verifica che chi richiede sia il proprietario della casa
        const { data: house, error: houseError } = await supabase
          .from('houses')
          .select('owner_id')
          .eq('id', houseId as string)
          .single();

        if (houseError || !house) {
          return { success: false, message: 'Casa non trovata' };
        }
        if (house.owner_id !== requestedByUserId) {
          return { success: false, message: 'Solo il proprietario può rimuovere i membri' };
        }

        // Verifica di non rimuovere se stessi (il proprietario)
        const { data: memberToRemove } = await supabase
          .from('house_members')
          .select('user_id')
          .eq('id', memberId as string)
          .single();
        if (memberToRemove?.user_id === requestedByUserId) {
          return { success: false, message: 'Non puoi rimuovere te stesso dalla casa' };
        }

        const { error } = await supabase
          .from('house_members')
          .delete()
          .eq('id', memberId as string)
          .eq('house_id', houseId as string);

        if (error) return handleSupabaseError(error);

        return { success: true };
      }

      default:
        return {
          success: false,
          message: `Azione sconosciuta: ${action}`
        };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
};
