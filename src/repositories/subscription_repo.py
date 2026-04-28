# -*- coding: utf-8 -*-
"""Subscription repository — CRUD for email_subscriptions table."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy.exc import IntegrityError

from src.storage import DatabaseManager, EmailSubscription

logger = logging.getLogger(__name__)

VALID_CONTENT_TYPES = {"analysis", "market_review"}


class SubscriptionRepository:
    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager.get_instance()

    def upsert(self, email: str, content_types: List[str]) -> EmailSubscription:
        """Create or update a subscription. Returns the saved record."""
        cleaned = sorted({ct for ct in content_types if ct in VALID_CONTENT_TYPES})
        with self.db.get_session() as session:
            existing = session.query(EmailSubscription).filter_by(email=email).first()
            if existing:
                existing.content_types = json.dumps(cleaned)
                existing.active = True
                session.commit()
                session.refresh(existing)
                return existing
            row = EmailSubscription(
                id=str(uuid.uuid4()),
                email=email,
                content_types=json.dumps(cleaned),
                created_at=datetime.now(),
                active=True,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return row

    def list_all(self) -> List[EmailSubscription]:
        with self.db.get_session() as session:
            rows = session.query(EmailSubscription).order_by(EmailSubscription.created_at.desc()).all()
            # Detach from session so callers can access fields freely
            for r in rows:
                session.expunge(r)
            return rows

    def delete(self, sub_id: str) -> bool:
        with self.db.get_session() as session:
            row = session.query(EmailSubscription).filter_by(id=sub_id).first()
            if not row:
                return False
            session.delete(row)
            session.commit()
            return True

    def get_emails_for_content_type(self, content_type: str) -> List[str]:
        """Return active subscriber emails that include content_type."""
        with self.db.get_session() as session:
            rows = session.query(EmailSubscription).filter_by(active=True).all()
            result = []
            for r in rows:
                try:
                    types = json.loads(r.content_types or "[]")
                except Exception:
                    types = []
                if content_type in types:
                    result.append(r.email)
            return result
