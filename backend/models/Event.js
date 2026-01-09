const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  event_type: {
    type: String,
    required: true,
    enum: ['page_view', 'click', 'form_submit', 'input_change', 'input_focus', 'scroll', 'button_click', 'image_view']
  },
  page_url: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  click_x: {
    type: Number,
    required: function() {
      return ['click', 'button_click'].includes(this.event_type);
    }
  },
  click_y: {
    type: Number,
    required: function() {
      return ['click', 'button_click'].includes(this.event_type);
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ page_url: 1, event_type: 1 });

module.exports = mongoose.model('Event', eventSchema);