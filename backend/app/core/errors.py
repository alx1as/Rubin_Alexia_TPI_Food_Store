from contextlib import contextmanager
from collections.abc import Iterator
from fastapi import HTTPException


class DomainError(Exception):
    def __init__(self, code: int, detail: str):
        self.code = code
        self.detail = detail
        super().__init__(detail)


@contextmanager
def http_errors() -> Iterator[None]:
    try:
        yield
    except DomainError as exc:
        raise HTTPException(status_code=exc.code, detail=exc.detail) from exc
