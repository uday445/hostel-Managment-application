package com.pghostel.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    public FileUploadConfig() {
        try {
            Files.createDirectories(Path.of("uploads", "idproof"));
            Files.createDirectories(Path.of("uploads", "payments"));
        } catch (Exception e) {
            throw new RuntimeException("Unable to create upload folders", e);
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
