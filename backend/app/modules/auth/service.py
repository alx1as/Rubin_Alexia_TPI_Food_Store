from app.modules.usuarios.service import UsuarioService


class AuthService(UsuarioService):
    """Auth comparte el modelo Usuario; no necesita una tabla propia."""
