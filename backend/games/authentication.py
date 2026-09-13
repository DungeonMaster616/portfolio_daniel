from rest_framework.authentication import SessionAuthentication


class CSRFAuthentication(SessionAuthentication):
    def authenticate(self, request):
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            self.enforce_csrf(request)
        return super().authenticate(request)
