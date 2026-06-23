"""create voice personalities table and seed data

Revision ID: 004
Revises: 003
Create Date: 2025-12-23

"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'voice_personalities',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('gender', sa.String(20), nullable=False),
        sa.Column('personality_description', sa.Text(), nullable=False),
        sa.Column('audio_sample_url', sa.String(500), nullable=False),
        sa.Column('cultural_appropriateness', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Seed 7 voice personalities
    op.execute("""
        INSERT INTO voice_personalities (id, name, gender, personality_description, audio_sample_url, cultural_appropriateness) VALUES
        ('arlow', 'Arlow', 'Male', 'Warm and encouraging, perfect for beginners', '/voices/arlow.mp3', 'Neutral accent, globally appropriate'),
        ('silas', 'Silas', 'Male', 'Calm and patient, great for detailed instructions', '/voices/silas.mp3', 'Neutral accent, globally appropriate'),
        ('hugo', 'Hugo', 'Male', 'Energetic and motivating, keeps you engaged', '/voices/hugo.mp3', 'Neutral accent, globally appropriate'),
        ('omar', 'Omar', 'Male', 'Friendly and conversational, feels like a cooking buddy', '/voices/omar.mp3', 'Neutral accent, globally appropriate'),
        ('felix', 'Felix', 'Male', 'Clear and precise, ideal for following steps', '/voices/felix.mp3', 'Neutral accent, globally appropriate'),
        ('elara', 'Elara', 'Female', 'Gentle and supportive, builds your confidence', '/voices/elara.mp3', 'Neutral accent, globally appropriate'),
        ('maya', 'Maya', 'Female', 'Cheerful and upbeat, makes cooking fun', '/voices/maya.mp3', 'Neutral accent, globally appropriate')
    """)


def downgrade():
    op.drop_table('voice_personalities')
