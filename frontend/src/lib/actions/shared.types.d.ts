export interface CreateUserParams {
  walletAddress?: string;
  username?: string | null;
  image?: string | null;
}

export interface GetUserParams {
  walletAddress?: string;
}

export interface DeleteUserParams {
  clerkUserId: string;
}

// export interface GetUserParams {
//   _id: string;
//   clerkUserId: string;
//   email: string;
//   username: string | null;
//   image: string;
//   createAt: Date;
// }

interface User {
  _id: string;
  email: string;
  image: string;
  walletAddress: string;
  username: string;
}

export interface CreatePostParams {
  name: string;
}

export interface GetPostParams {
  _id: string;
  name: string;
  banner: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
}

export interface GetTicketParams {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  event: {
    _id: string;
    name: string;
    image: string;
  };
}
