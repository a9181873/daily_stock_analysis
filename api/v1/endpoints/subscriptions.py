# -*- coding: utf-8 -*-
"""
Email subscription endpoints.

Public:
  POST /api/v1/subscribe          — anyone with the subscription password can subscribe

Admin (requires valid admin session when auth is enabled):
  GET  /api/v1/subscriptions      — list all subscriptions
  DELETE /api/v1/subscriptions/{sub_id} — delete a subscription
"""

from __future__ import annotations

import json
import logging
import os
import re

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from src.auth import COOKIE_NAME, is_auth_enabled, verify_session
from src.repositories.subscription_repo import SubscriptionRepository, VALID_CONTENT_TYPES

logger = logging.getLogger(__name__)

public_router = APIRouter()
admin_router = APIRouter()

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _get_subscription_password() -> str:
    return os.getenv("SUBSCRIPTION_PASSWORD", "8888")


def _require_admin(request: Request) -> None:
    """Raise 401 if admin auth is enabled and the request has no valid session."""
    if not is_auth_enabled():
        return
    cookie_val = request.cookies.get(COOKIE_NAME)
    if not cookie_val or not verify_session(cookie_val):
        raise HTTPException(status_code=401, detail="Login required")


class SubscribeRequest(BaseModel):
    email: str = Field(..., description="Subscriber email")
    password: str = Field(..., description="Subscription password")
    content_types: list[str] = Field(default_factory=list, description="Content types to subscribe")


@public_router.post(
    "",
    summary="Subscribe to email notifications",
    description="Anyone with the subscription password can subscribe.",
)
async def subscribe(body: SubscribeRequest):
    email = (body.email or "").strip().lower()
    if not _EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    if body.password != _get_subscription_password():
        raise HTTPException(status_code=403, detail="Incorrect subscription password")

    valid_types = [ct for ct in body.content_types if ct in VALID_CONTENT_TYPES]
    if not valid_types:
        raise HTTPException(status_code=400, detail="Please select at least one content type")

    repo = SubscriptionRepository()
    sub = repo.upsert(email, valid_types)
    return {
        "id": sub.id,
        "email": sub.email,
        "content_types": json.loads(sub.content_types or "[]"),
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
    }


@admin_router.get(
    "",
    summary="List all subscriptions (admin)",
)
async def list_subscriptions(request: Request):
    _require_admin(request)
    repo = SubscriptionRepository()
    rows = repo.list_all()
    return {
        "total": len(rows),
        "items": [
            {
                "id": r.id,
                "email": r.email,
                "content_types": json.loads(r.content_types or "[]"),
                "active": r.active,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
    }


@admin_router.delete(
    "/{sub_id}",
    summary="Delete a subscription (admin)",
)
async def delete_subscription(sub_id: str, request: Request):
    _require_admin(request)
    repo = SubscriptionRepository()
    deleted = repo.delete(sub_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"ok": True}
