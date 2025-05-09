from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

# Define the intermediate table model MachineTestCase
class MachineTestCase(SQLModel, table=True):
    __tablename__ = "machine_test_cases"
    machine_id: int = Field(foreign_key="machines.id", primary_key=True)
    test_case_id: int = Field(foreign_key="test_cases.id", primary_key=True)

# Define the TestCase model
class TestCase(SQLModel, table=True):
    __tablename__ = "test_cases"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, nullable=False)
    type: Optional[str] = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    # Many-to-many relationship: Linked to Machine via MachineTestCase
    machines: List["Machine"] = Relationship(back_populates="test_cases", link_model=MachineTestCase)

# Define the Machine model
class Machine(SQLModel, table=True):
    __tablename__ = "machines"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    test_type: str = Field(max_length=50, nullable=False)
    agent_version_id: int = Field(foreign_key="agent_versions.id", nullable=False)  # Fixed: Changed 'forward_key' to 'foreign_key'
    ip: str = Field(max_length=15, nullable=False)
    username: str = Field(max_length=255, nullable=False)
    password: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    # One-to-many relationship: Linked to AgentVersion
    agent_version: Optional["AgentVersion"] = Relationship(back_populates="machines")
    # Many-to-many relationship: Linked to TestCase via MachineTestCase
    test_cases: List["TestCase"] = Relationship(back_populates="machines", link_model=MachineTestCase)

# Define the AgentVersion model
class AgentVersion(SQLModel, table=True):
    __tablename__ = "agent_versions"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    # One-to-many relationship: Linked to Machine
    machines: List["Machine"] = Relationship(back_populates="agent_version")