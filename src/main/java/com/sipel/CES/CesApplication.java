package com.sipel.CES;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CesApplication {

	public static void main(String[] args) {
		SpringApplication.run(CesApplication.class, args);
	}

}
