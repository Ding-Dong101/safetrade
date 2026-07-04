$uri = "http://localhost:8080/api/auth/login"
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $uri -Method Post -ContentType "application/json" -Body $body
$response.Content
