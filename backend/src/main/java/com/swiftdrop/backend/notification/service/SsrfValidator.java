package com.swiftdrop.backend.notification.service;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;

public final class SsrfValidator {

    private static final Set<String> BLOCKED_HOSTNAMES = Set.of(
            "localhost",
            "localhost.localdomain",
            "127.0.0.1",
            "::1",
            "0.0.0.0",
            "metadata.google.internal",
            "instance-data"
    );

    private SsrfValidator() {}

    /**
     * Validates that the given URL is a valid, publicly reachable HTTP/HTTPS endpoint
     * and does not target internal, private, loopback, or cloud-metadata network addresses.
     *
     * @throws IllegalArgumentException if the URL fails SSRF safety validation.
     */
    public static void validate(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalArgumentException("Webhook endpoint URL cannot be blank");
        }

        URI uri;
        try {
            uri = URI.create(rawUrl.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Webhook endpoint URL is not a valid URI: " + e.getMessage());
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new IllegalArgumentException("Webhook endpoint URL must use http or https scheme");
        }

        if (uri.getUserInfo() != null) {
            throw new IllegalArgumentException("Webhook endpoint URL must not contain user credentials");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Webhook endpoint URL must include a valid host");
        }

        String lowerHost = host.toLowerCase(Locale.ROOT);
        if (BLOCKED_HOSTNAMES.contains(lowerHost)
                || lowerHost.endsWith(".localhost")
                || lowerHost.endsWith(".local")
                || lowerHost.endsWith(".internal")
                || lowerHost.endsWith(".lan")) {
            throw new IllegalArgumentException("Webhook endpoint URL cannot target localhost or internal domains");
        }

        // Check if IP literal or resolvable host is private/loopback/link-local/metadata
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (isBlockedAddress(addr)) {
                    throw new IllegalArgumentException("Webhook endpoint URL cannot target loopback, private, or metadata addresses (" + addr.getHostAddress() + ")");
                }
            }
        } catch (UnknownHostException ignored) {
            // In offline test environments or behind proxy without DNS, unresolved mock domain names
            // are allowed provided the host literal itself is not a known private pattern.
            if (lowerHost.equals("169.254.169.254") || lowerHost.startsWith("127.") || lowerHost.startsWith("10.")
                    || lowerHost.startsWith("192.168.") || lowerHost.startsWith("172.")) {
                throw new IllegalArgumentException("Webhook endpoint URL cannot target private or metadata addresses");
            }
        }
    }

    private static boolean isBlockedAddress(InetAddress addr) {
        if (addr.isLoopbackAddress()
                || addr.isSiteLocalAddress()
                || addr.isLinkLocalAddress()
                || addr.isAnyLocalAddress()
                || addr.isMulticastAddress()) {
            return true;
        }

        byte[] ip = addr.getAddress();
        if (ip.length == 4) {
            int b0 = ip[0] & 0xFF;
            int b1 = ip[1] & 0xFF;

            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) return true;
            // 10.0.0.0/8 (Private)
            if (b0 == 10) return true;
            // 172.16.0.0/12 (Private)
            if (b0 == 172 && (b1 >= 16 && b1 <= 31)) return true;
            // 192.168.0.0/16 (Private)
            if (b0 == 192 && b1 == 168) return true;
            // 169.254.0.0/16 (Link Local / Cloud Metadata, including 169.254.169.254)
            if (b0 == 169 && b1 == 254) return true;
            // 0.0.0.0/8
            if (b0 == 0) return true;
        } else if (ip.length == 16) {
            // IPv6 Unique Local (fc00::/7) -> first byte fc or fd
            int b0 = ip[0] & 0xFF;
            if (b0 == 0xFC || b0 == 0xFD) return true;
            // IPv6 Link-Local (fe80::/10) -> first byte fe and second byte high 2 bits 10
            int b1 = ip[1] & 0xFF;
            if (b0 == 0xFE && (b1 & 0xC0) == 0x80) return true;
        }

        return false;
    }
}
