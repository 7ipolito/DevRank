"use server";

import { GET_TICKET } from "@/graphql/queries";
import client from "@/lib/client";

export async function getTickets(postId: string) {
  try {
    console.log(postId);
    const response = await client.query({
      query: GET_TICKET,
      variables: {
        findTicketInput: {
          eventId: postId,
        },
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket data:", error);
    throw new Error("Could not fetch ticket data.");
  }
}
