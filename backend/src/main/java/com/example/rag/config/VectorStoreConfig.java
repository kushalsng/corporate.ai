package com.example.rag.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class VectorStoreConfig {
    // Spring AI auto-configuration handles the PgVectorStore bean creation
    // based on application.properties.
    // We can add custom configuration here if needed, but for now,
    // the starter dependency is sufficient.
}
