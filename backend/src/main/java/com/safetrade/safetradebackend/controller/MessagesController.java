package com.safetrade.safetradebackend.controller;
import com.safetrade.safetradebackend.model.Message;
import com.safetrade.safetradebackend.repository.MessagesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
@CrossOrigin
@RestController
@RequestMapping("/api/messages")
public class MessagesController {
    private final MessagesRepository messagesRepository;
    private final SimpMessagingTemplate messagingTemplate;
    public MessagesController(MessagesRepository messagesRepository, SimpMessagingTemplate messagingTemplate) {
        this.messagesRepository = messagesRepository;
        this.messagingTemplate = messagingTemplate;
    }
    @GetMapping("/trade/{tradeId}")
    public List<Message> getMessagesForTrade(@PathVariable String tradeId) {
        return messagesRepository.findByTradeIdOrderBySentAtAsc(tradeId);
    }
    @PostMapping("/trade/{tradeId}")
    public ResponseEntity<Message> sendMessage(
            @PathVariable String tradeId,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Message message = Message.builder()
                .tradeId(tradeId)
                .senderId(principal.getName())
                .content(body.get("content"))
                .read(false)
                .sentAt(LocalDateTime.now())
                .build();
        Message saved = messagesRepository.save(message);
        return ResponseEntity.status(201).body(saved);
    }
    @PatchMapping("/trade/{tradeId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String tradeId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<Message> messages = messagesRepository.findByTradeIdOrderBySentAtAsc(tradeId);
        for (Message m : messages) {
            if (!m.getSenderId().equals(principal.getName()) && !m.isRead()) {
                m.setRead(true);
                messagesRepository.save(m);
            }
        }
        return ResponseEntity.ok().build();
    }

    @MessageMapping("/chat/{tradeId}")
    public void handleChatMessage(@DestinationVariable String tradeId, Map<String, String> body) {
        Message message = Message.builder()
                .tradeId(tradeId)
                .senderId(body.get("senderId"))
                .content(body.get("content"))
                .read(false)
                .sentAt(LocalDateTime.now())
                .build();

        Message saved = messagesRepository.save(message);
        messagingTemplate.convertAndSend("/topic/trade/" + tradeId, saved);
    }
}