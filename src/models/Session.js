const { Schema, model } = require('mongoose');

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    toJSON: {
      transform(_, session) {
        delete session.__v;
        session.createdAt = session.createdAt.getTime();
        session.updatedAt = session.updatedAt.getTime();
        return session;
      },
    },
  }
);

SessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = model('session', SessionSchema);
