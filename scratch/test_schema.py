from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, UUID

class SOSResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    alert_type: str
    severity: str
    initial_latitude: float
    initial_longitude: float
    initial_accuracy: Optional[float]
    initial_address: Optional[str]
    message: Optional[str]
    contacts_notified: int
    created_at: datetime
    updated_at: Optional[datetime]
    client_created_at: Optional[datetime]
    offline_id: Optional[str]
    assigned_to: Optional[UUID] = None
    assigned_at: Optional[datetime] = None

try:
    s = SOSResponse(
        id=uuid4(),
        user_id=None,
        status="active",
        alert_type="manual",
        severity="high",
        initial_latitude=0.0,
        initial_longitude=0.0,
        initial_accuracy=None,
        initial_address=None,
        message=None,
        contacts_notified=0,
        created_at=datetime.now(),
        updated_at=None,
        client_created_at=None,
        offline_id=None
    )
    print("Validation succeeded")
except Exception as e:
    print(f"Validation failed: {e}")
