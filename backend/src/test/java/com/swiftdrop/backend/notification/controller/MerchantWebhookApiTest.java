package com.swiftdrop.backend.notification.controller;

import com.swiftdrop.backend.notification.repository.MerchantWebhookConfigRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MerchantWebhookApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MerchantWebhookConfigRepository webhookRepository;

    @Test
    void unauthenticatedCall_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/merchants/me/webhooks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonMerchantUser_returnsForbidden() throws Exception {
        UUID userId = UUID.randomUUID();
        mockMvc.perform(get("/api/merchants/me/webhooks")
                        .with(jwt().jwt(builder -> builder.subject(userId.toString()))
                                .authorities(new SimpleGrantedAuthority("customer:profile-manage"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAndListWebhooks_success() throws Exception {
        UUID merchantOwnerId = UUID.randomUUID();

        String payload = """
                {
                  "endpointUrl": "https://api.merchantstore.com/webhooks/swiftdrop",
                  "subscribedEvents": "DELIVERY_STATUS_CHANGED,DELIVERY_CONFIRMED",
                  "secretKey": "my-secure-webhook-secret-key-12345"
                }
                """;

        MvcResult createResult = mockMvc.perform(post("/api/merchants/me/webhooks")
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.endpointUrl").value("https://api.merchantstore.com/webhooks/swiftdrop"))
                .andExpect(jsonPath("$.subscribedEvents").value("DELIVERY_STATUS_CHANGED,DELIVERY_CONFIRMED"))
                .andExpect(jsonPath("$.secretKey").value("my-secure-webhook-secret-key-12345"))
                .andExpect(jsonPath("$.active").value(true))
                .andReturn();

        JsonNode createdNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long webhookId = createdNode.get("id").asLong();

        // List webhooks
        mockMvc.perform(get("/api/merchants/me/webhooks")
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(webhookId));

        // Get single webhook
        mockMvc.perform(get("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(webhookId))
                .andExpect(jsonPath("$.endpointUrl").value("https://api.merchantstore.com/webhooks/swiftdrop"));

        // Update webhook
        String updatePayload = """
                {
                  "endpointUrl": "https://api.merchantstore.com/webhooks/updated",
                  "subscribedEvents": "*",
                  "active": false
                }
                """;

        mockMvc.perform(put("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.endpointUrl").value("https://api.merchantstore.com/webhooks/updated"))
                .andExpect(jsonPath("$.subscribedEvents").value("*"))
                .andExpect(jsonPath("$.active").value(false));

        // Delete webhook
        mockMvc.perform(delete("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isNoContent());

        // Verify gone
        mockMvc.perform(get("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWebhook_autoGeneratesSecretWhenOmitted() throws Exception {
        UUID merchantOwnerId = UUID.randomUUID();

        String payload = """
                {
                  "endpointUrl": "https://callback.partner.com/events",
                  "subscribedEvents": "DELIVERY_DELIVERED"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/merchants/me/webhooks")
                        .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.secretKey").isNotEmpty())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        String secret = node.get("secretKey").asText();
        assertThat(secret).hasSize(64);
    }

    @Test
    void ssrfProtection_blocksLocalhostAndPrivateIps() throws Exception {
        UUID merchantOwnerId = UUID.randomUUID();

        String[] forbiddenUrls = new String[]{
                "http://localhost:8080/webhook",
                "http://127.0.0.1:8080/callback",
                "http://169.254.169.254/latest/meta-data",
                "http://10.0.0.1/admin",
                "http://192.168.1.50/hook",
                "http://internal.lan/hook"
        };

        for (String url : forbiddenUrls) {
            String payload = String.format("""
                    {
                      "endpointUrl": "%s",
                      "subscribedEvents": "*"
                    }
                    """, url);

            mockMvc.perform(post("/api/merchants/me/webhooks")
                            .with(jwt().jwt(builder -> builder.subject(merchantOwnerId.toString()))
                                    .authorities(new SimpleGrantedAuthority("merchant:api-access")))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void merchantIsolation_cannotAccessAnotherMerchantsWebhook() throws Exception {
        UUID merchant1Owner = UUID.randomUUID();
        UUID merchant2Owner = UUID.randomUUID();

        String payload = """
                {
                  "endpointUrl": "https://m1.com/hook",
                  "subscribedEvents": "*"
                }
                """;

        MvcResult createResult = mockMvc.perform(post("/api/merchants/me/webhooks")
                        .with(jwt().jwt(builder -> builder.subject(merchant1Owner.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn();

        long webhookId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Merchant 2 tries to GET Merchant 1's webhook -> 404 Not Found
        mockMvc.perform(get("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchant2Owner.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isNotFound());

        // Merchant 2 tries to DELETE Merchant 1's webhook -> 404 Not Found
        mockMvc.perform(delete("/api/merchants/me/webhooks/" + webhookId)
                        .with(jwt().jwt(builder -> builder.subject(merchant2Owner.toString()))
                                .authorities(new SimpleGrantedAuthority("merchant:api-access"))))
                .andExpect(status().isNotFound());
    }
}
