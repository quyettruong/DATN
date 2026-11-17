package com.hospital.websocket;

import com.hospital.dto.QueueTicketResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class QueueWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastQueueUpdate(Long roomId, QueueTicketResponse ticketUpdate) {
        messagingTemplate.convertAndSend("/topic/queue/" + roomId, ticketUpdate);
    }
}
