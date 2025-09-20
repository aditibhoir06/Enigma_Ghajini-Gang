import React, { useEffect, useState } from 'react';

interface ScreenReaderAnnouncementsProps {
  children: React.ReactNode;
}

// Global announcement queue
let announcementQueue: string[] = [];
let isProcessing = false;

export const announceToScreenReader = (message: string) => {
  announcementQueue.push(message);
  if (!isProcessing) {
    processQueue();
  }
};

const processQueue = () => {
  if (announcementQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const message = announcementQueue.shift();

  if (message) {
    // Create a temporary element for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
      // Process next message after a brief delay
      setTimeout(processQueue, 100);
    }, 1000);
  }
};

export const ScreenReaderAnnouncements: React.FC<ScreenReaderAnnouncementsProps> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  return (
    <>
      {children}
      {/* Screen reader only announcements */}
      <div className="sr-only">
        {announcements.map((announcement, index) => (
          <div
            key={index}
            role="status"
            aria-live="assertive"
            aria-atomic="true"
          >
            {announcement}
          </div>
        ))}
      </div>
    </>
  );
};