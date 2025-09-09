package com.ctrainer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                    "/admin_dashboard_access.html", 
                    "/js/admin_dashboard_access.js", 
                    "/api/all"
                ).hasRole("ADMIN")
                .antMatchers(HttpMethod.POST, "/api/usr/{uid}/fio", "/api/usr/{uid}/pwd").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/usr/{uid}", "/api/admin/clear-all").hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .formLogin(f -> f
                .loginPage("/index.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/admin_dashboard_access.html", true)
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