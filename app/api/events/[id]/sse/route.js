import { headers } from 'next/headers';

const eventClients = new Map();

export async function GET(request, { params }) {
  const eventId = params.id;
  let controller;

  // Get response headers
  const headersList = headers();
  
  // Create response object with appropriate headers for SSE
  const response = new Response(
    new ReadableStream({
      start(ctrl) {
        controller = ctrl;
        // Store the controller for this client
        if (!eventClients.has(eventId)) {
          eventClients.set(eventId, new Set());
        }
        eventClients.get(eventId).add(controller);

        // Send initial message
        const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      },
      cancel() {
        // Remove client when connection is closed
        if (controller && eventClients.get(eventId)) {
          eventClients.get(eventId).delete(controller);
          if (eventClients.get(eventId).size === 0) {
            eventClients.delete(eventId);
          }
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}

// Helper function to broadcast updates to all clients for an event
export function broadcastUpdate(eventId, data) {
  const clients = eventClients.get(eventId);
  if (!clients) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  
  // Create a new Set to store controllers that need to be removed
  const deadControllers = new Set();
  
  clients.forEach((client) => {
    try {
      client.enqueue(encoder.encode(message));
    } catch (error) {
      // If controller is closed, mark it for removal
      if (error.code === 'ERR_INVALID_STATE') {
        deadControllers.add(client);
      }
    }
  });

  // Clean up dead controllers
  deadControllers.forEach(deadClient => {
    clients.delete(deadClient);
  });

  // If no clients left, remove the event entirely
  if (clients.size === 0) {
    eventClients.delete(eventId);
  }
} 