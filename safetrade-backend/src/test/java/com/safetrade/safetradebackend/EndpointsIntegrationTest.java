package com.safetrade.safetradebackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safetrade.safetradebackend.controller.TradesController;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.TradesRepository;
import com.safetrade.safetradebackend.repository.UsersRepository;
import com.safetrade.safetradebackend.service.EscrowService;
import com.safetrade.safetradebackend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private TradesRepository tradesRepository;

    @MockBean
    private EscrowService escrowService;

    @MockBean
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        tradesRepository.deleteAll();
        usersRepository.deleteAll();

        // Mock external service responses
        when(escrowService.fundEscrow(any(), any(), any())).thenReturn("mock_success");
        when(escrowService.releaseFunds(any(), any(), any())).thenReturn("mock_success");
        when(escrowService.refundBuyer(any())).thenReturn("mock_success");
        doNothing().when(notificationService).sendPushNotification(any(), any(), any());
    }

    private String getJwtTokenForUser(String username, String password) throws Exception {
        Users loginUser = new Users();
        loginUser.setUsername(username);
        loginUser.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        Map<String, Object> map = objectMapper.readValue(response, Map.class);
        return (String) map.get("token");
    }

    private Users createAndSaveUser(String username) {
        Users user = new Users();
        user.setUsername(username);
        user.setPassword("password123");
        user.setFirstname("First");
        user.setLastname("Last");
        user.setEmail(username + "@test.com");
        user.setBalance(0.0);
        return usersRepository.save(user);
    }

    @Test
    void testUserEndpoints() throws Exception {
        // 1. Register User
        Users newUser = new Users();
        newUser.setUsername("testuser");
        newUser.setPassword("password123");
        newUser.setFirstname("Test");
        newUser.setLastname("User");
        newUser.setEmail("test@test.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());

        // 2. Login User
        String token = getJwtTokenForUser("testuser", "password123");

        // Fetch User ID from DB
        Users savedUser = usersRepository.findByUsername("testuser").orElseThrow();

        // 3. Get User by ID
        mockMvc.perform(get("/api/v2/users/" + savedUser.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));

        // 4. Get User by Username
        mockMvc.perform(get("/api/v2/users/get/username/testuser")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));

        // 5. Get All Users
        mockMvc.perform(get("/api/v2/users/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testuser"));

        // 6. Topup
        mockMvc.perform(post("/api/v2/users/topup")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 100.0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(100.0));

        // 7. Push Token
        mockMvc.perform(post("/api/v2/users/push-token")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pushToken\": \"expo_token_123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testTradeFlowAndEscrowEndpoints() throws Exception {
        Users buyer = createAndSaveUser("buyer");
        Users seller = createAndSaveUser("seller");
        String buyerToken = getJwtTokenForUser("buyer", "password123");

        // Create Trade
        Trades tradeRequest = new Trades();
        tradeRequest.setTitle("Test Item");
        tradeRequest.setDescription("A very nice item");
        tradeRequest.setPrice(50.0);
        tradeRequest.setSellerId(seller.getId().toString());
        tradeRequest.setBuyerId(buyer.getId().toString());

        MvcResult createResult = mockMvc.perform(post("/api/trades/")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tradeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        Trades createdTrade = objectMapper.readValue(createResult.getResponse().getContentAsString(), Trades.class);
        String tradeId = createdTrade.getId().toString();

        // Escrow endpoints checks using the created trade

        // /api/escrow/status/{tradeId}
        mockMvc.perform(get("/api/escrow/status/" + tradeId)
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // deposit
        mockMvc.perform(post("/api/trades/" + tradeId + "/deposit")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FUNDED"));

        // seller upload
        TradesController.SellerUploadRequest uploadReq = new TradesController.SellerUploadRequest();
        uploadReq.setItemPhotoBase64("base64data");
        mockMvc.perform(post("/api/trades/" + tradeId + "/seller-upload")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(uploadReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DISPATCH_PENDING"));

        Trades updatedTrade = tradesRepository.findById(UUID.fromString(tradeId)).orElseThrow();
        String dispatchCode = updatedTrade.getDispatchCode();

        // rider pickup
        TradesController.RiderPickupRequest pickupReq = new TradesController.RiderPickupRequest();
        pickupReq.setRiderId("rider_123");
        pickupReq.setDispatchCode(dispatchCode);
        mockMvc.perform(post("/api/trades/" + tradeId + "/rider-pickup")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pickupReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRANSIT"));

        updatedTrade = tradesRepository.findById(UUID.fromString(tradeId)).orElseThrow();
        String dropOffCode = updatedTrade.getDropOffCode();

        // post dropoff
        TradesController.PostDropoffRequest dropoffReq = new TradesController.PostDropoffRequest();
        dropoffReq.setDropOffCode(dropOffCode);
        mockMvc.perform(post("/api/trades/" + tradeId + "/post-dropoff")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dropoffReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AT_POST"));

        updatedTrade = tradesRepository.findById(UUID.fromString(tradeId)).orElseThrow();
        String releaseCode = updatedTrade.getReleaseCode();

        // buyer collect
        TradesController.BuyerCollectRequest collectReq = new TradesController.BuyerCollectRequest();
        collectReq.setReleaseCode(releaseCode);
        mockMvc.perform(post("/api/trades/" + tradeId + "/buyer-collect")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(collectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RELEASED"));

        // Get trades
        mockMvc.perform(get("/api/trades/")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(tradeId));
    }

    @Test
    void testEscrowControllerSpecifics() throws Exception {
        Users buyer = createAndSaveUser("escrowbuyer");
        Users seller = createAndSaveUser("escrowseller");
        String token = getJwtTokenForUser("escrowbuyer", "password123");

        Trades trade = new Trades();
        trade.setTitle("Escrow Test");
        trade.setPrice(10.0);
        trade.setBuyerId(buyer.getId().toString());
        trade.setSellerId(seller.getId().toString());
        trade.setStatus(com.safetrade.safetradebackend.model.TradeStatus.CREATED);
        trade = tradesRepository.save(trade);
        String tradeId = trade.getId().toString();

        // init
        mockMvc.perform(post("/api/escrow/init/" + tradeId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // fund
        mockMvc.perform(post("/api/escrow/fund/" + tradeId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FUNDED"));

        // deliver
        mockMvc.perform(patch("/api/escrow/deliver/" + tradeId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        // release
        mockMvc.perform(post("/api/escrow/release/" + tradeId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RELEASED"));
    }

    @Test
    void testEscrowRefund() throws Exception {
        Users buyer = createAndSaveUser("refundbuyer");
        Users seller = createAndSaveUser("refundseller");
        String token = getJwtTokenForUser("refundbuyer", "password123");

        Trades trade = new Trades();
        trade.setTitle("Refund Test");
        trade.setPrice(10.0);
        trade.setBuyerId(buyer.getId().toString());
        trade.setSellerId(seller.getId().toString());
        // must be PENDING or FUNDED to refund
        trade.setStatus(com.safetrade.safetradebackend.model.TradeStatus.FUNDED);
        trade = tradesRepository.save(trade);
        String tradeId = trade.getId().toString();

        // refund
        mockMvc.perform(post("/api/escrow/refund/" + tradeId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    @Test
    void testNotificationEndpoint() throws Exception {
        createAndSaveUser("testuser");
        String token = getJwtTokenForUser("testuser", "password123"); 

        mockMvc.perform(post("/api/notify")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":\"123\", \"type\":\"INFO\", \"message\":\"Test Message\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }
}
