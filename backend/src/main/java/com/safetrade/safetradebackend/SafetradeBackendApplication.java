package com.safetrade.safetradebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SafetradeBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SafetradeBackendApplication.class, args);
    }

}

