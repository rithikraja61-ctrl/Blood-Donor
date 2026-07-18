package com.blooddonor.service;

import com.blooddonor.config.BloodDonorMailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final BloodDonorMailProperties mailProperties;
    private final String mailHost;
    private final String mailUsername;
    private final String mailPassword;

    public EmailService(
            JavaMailSender mailSender,
            BloodDonorMailProperties mailProperties,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
        this.mailHost = mailHost;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
    }

    public void sendEmail(String to, String subject, String body) {
        if (!StringUtils.hasText(to)) {
            log.warn("Skipped email — recipient address is empty. Subject: {}", subject);
            return;
        }

        if (!isMailConfigured()) {
            log.info(
                    "Slashy-style automation (mail disabled). To: {} | Subject: {} | Body: {}",
                    to,
                    subject,
                    body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(formatFromAddress());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Automation email sent to {} — {}", to, subject);
        } catch (Exception ex) {
            log.error("Failed to send email to {} — {}", to, subject, ex);
        }
    }

    public boolean isMailConfigured() {
        if (!mailProperties.isEnabled()) {
            return false;
        }
        if (isLocalMailhog()) {
            return true;
        }
        return StringUtils.hasText(mailUsername) && StringUtils.hasText(mailPassword);
    }

    private boolean isLocalMailhog() {
        return StringUtils.hasText(mailHost) && mailHost.toLowerCase().contains("mailhog");
    }

    private String formatFromAddress() {
        String fromEmail = StringUtils.hasText(mailUsername)
                ? mailUsername
                : "noreply@blooddonor.local";
        return mailProperties.getFromName() + " <" + fromEmail + ">";
    }
}
