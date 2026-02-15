export interface User {
  id: string;
  name: string;
  email: string;
}

export interface House {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface HouseMember {
  id: string;
  houseId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface Task {
  id: number;
  title: string;
  assignee: string;
  assigneeId: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  category: string;
  houseId: string;
  createdBy: string;
  createdById: string;
}

export interface ShoppingItem {
  id: number;
  item: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  checkedAt?: string;
  category: string;
  houseId: string;
  addedBy: string;
  addedById: string;
  assignee?: string;
  assigneeId?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  user?: User;
  tasks?: Task[];
  shopping?: ShoppingItem[];
  members?: HouseMember[];
  houses?: House[];
  house?: House;
  invitations?: HouseInvitation[];
}

export interface HouseInvitation {
  id: string;
  houseId: string;
  houseName: string;
  invitedEmail: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
