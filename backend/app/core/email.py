import smtplib

from email.message import EmailMessage

from app.core.config import settings


def send_password_reset_email(
    recipient_email: str,
    reset_token: str,
) -> None:
    if not settings.smtp_host:
        raise RuntimeError(
            "SMTP is not configured"
        )

    if not settings.smtp_from_email:
        raise RuntimeError(
            "SMTP_FROM_EMAIL is not configured"
        )

    reset_url = (
        f"{settings.frontend_url.rstrip('/')}"
        f"/reset-password?token={reset_token}"
    )

    message = EmailMessage()

    message["Subject"] = "Reset your Scoping Matrix password"
    message["From"] = settings.smtp_from_email
    message["To"] = recipient_email

    message.set_content(
        "\n".join(
            [
                "You requested a password reset for your Scoping Matrix account.",
                "",
                "Use the link below to create a new password:",
                "",
                reset_url,
                "",
                "This link expires in 30 minutes.",
                "",
                "If you did not request a password reset, you can ignore this email.",
            ]
        )
    )

    with smtplib.SMTP(
        settings.smtp_host,
        settings.smtp_port,
        timeout=20,
    ) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()

        if (
            settings.smtp_username
            and settings.smtp_password
        ):
            smtp.login(
                settings.smtp_username,
                settings.smtp_password,
            )

        smtp.send_message(message)