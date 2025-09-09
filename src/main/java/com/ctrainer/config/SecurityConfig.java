package com.ctrainer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity h) throws Exception {
        h
            .csrf().disable()
            .authorizeRequests(a -> a
                .antMatchers(
                    "/a-panel-sess-id-7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d.html", 
                    "/js/a-panel-sess-id-7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d.js", 
                    "/api/all"
                ).hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .formLogin(f -> f
                .loginPage("/index.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/a-panel-sess-id-7a9b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d.html", true)
                .failureUrl("/index.html?error=true")
                .permitAll()
            );
        return h.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails adm = User.builder()
            .username("admin")
            .password("{noop}MasterY2008")
            .roles("ADMIN")
            .build();
        return new InMemoryUserDetailsManager(adm);
    }
}