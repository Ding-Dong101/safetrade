import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class GenerateToken {
    public static void main(String[] args) {
        // Secret key for JWT signing (same as in JwtService)
        SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
        
        // Generate token for admin user
        String username = "admin";
        long currentTime = System.currentTimeMillis();
        long expirationTime = currentTime + (1000 * 60 * 60 * 24); // 24 hours
        
        String token = Jwts.builder()
                .subject(username)
                .issuedAt(new Date(currentTime))
                .expiration(new Date(expirationTime))
                .signWith(SECRET_KEY)
                .compact();
        
        System.out.println("Bearer Token for admin user:");
        System.out.println("Authorization: Bearer " + token);
        System.out.println("\nToken (without Bearer prefix):");
        System.out.println(token);
        System.out.println("\nExpiration: 24 hours from now");
    }
}
