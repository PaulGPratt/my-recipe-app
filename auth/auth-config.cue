ClientID: "HwYzglVr42AziaPGLH8Milw2UOkQTWoM"
Domain: "dev-7gpl1ggd66ztt87k.us.auth0.com"

// An application running locally
if #Meta.Environment.Type == "development" && #Meta.Environment.Cloud == "local" {
	CallbackURL: "http://localhost:3000/callback"
	LogoutURL: "http://localhost:3000/"
}