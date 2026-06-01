from pydantic import BaseModel


VALID_ROLES = {"user", "trainer", "admin", "super-admin"}


class RoleUpdateRequest(BaseModel):
    role: str

    def model_post_init(self, __context):
        if self.role not in VALID_ROLES:
            raise ValueError(f"role must be one of {VALID_ROLES}")
