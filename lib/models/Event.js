import mongoose from 'mongoose';
import './User'; // Import User model to ensure it's registered

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['music', 'sports', 'technology', 'business', 'arts', 'other'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Event image is required'],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxAttendees: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for efficient querying
eventSchema.index({ date: 1, category: 1, status: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxAttendees) return false;
  return this.attendees.length >= this.maxAttendees;
});

// Method to check if event can accept more attendees
eventSchema.methods.canAcceptMoreAttendees = function() {
  if (!this.maxAttendees) return true;
  return this.attendees.length < this.maxAttendees;
};

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event; 