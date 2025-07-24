import logging

from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.core.db import engine, init_db
from app.models import ItemCreate, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session)

        sample_items = [
            ItemCreate(
                title="Welcome to FastAPI Template",
                description="This is a sample item to demonstrate the application functionality. You can create, edit, and delete items."
            ),
            ItemCreate(
                title="Project Documentation",
                description="Remember to update the README and add proper documentation for your project."
            ),
            ItemCreate(
                title="Database Migration",
                description="Set up your database migrations using Alembic for production deployment."
            ),
            ItemCreate(
                title="API Testing",
                description="Test your API endpoints using the interactive docs at /docs or with your favorite API client."
            ),
            ItemCreate(
                title="Frontend Integration",
                description="The React frontend automatically generates TypeScript clients from your FastAPI schema."
            ),
        ]

        superuser = session.exec(
            select(User).where(User.email == settings.FIRST_SUPERUSER)
        ).first()

        if superuser:
            for item_data in sample_items:
                crud.create_item(session=session, item_in=item_data, owner_id=superuser.id)
            logger.info(f"Created {len(sample_items)} sample items")


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
