package com.ctrainer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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
                .antMatchers("/admin.html", "/api/all", "/js/admin.js").hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .formLogin(f -> f
                .loginPage("/index.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/admin.html", true)
                .failureUrl("/index.html?error=true")
                .permitAll()
            );
        return h.build();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService(PasswordEncoder pwe) {
        UserDetails adm = User.builder()
            .username("admin")
            .password(pwe.encode("MasterY2008"))
            .roles("ADMIN")
            .build();
        return new InMemoryUserDetailsManager(adm);
    }
}