"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@/app/contexts/UserContext";

type Notification = {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const { user: loggedUser } = useUser();

  // Fetch notifications
  useEffect(() => {
    if (loggedUser) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch(
            `/api/dashboard/notifications?userId=${loggedUser.id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          const data = await res.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();
    }
  }, [loggedUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/dashboard/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Icons.bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-upwork-green text-xs text-white">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No notifications
            </p>
          ) : (
            <div className="max-h-[200px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={notification.read ? "opacity-50" : ""}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {truncateText(notification.title, 40)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {truncateText(notification.message, 60)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          <DropdownMenuItem asChild>
            <a href="/notifications" className="text-center w-full block">
              View All Notifications
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedNotification && (
        <Dialog
          open={!!selectedNotification}
          onOpenChange={() => setSelectedNotification(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNotification.title}</DialogTitle>
            </DialogHeader>
            <div className="text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
              {selectedNotification.message}
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  markAsRead(selectedNotification.id);
                  setSelectedNotification(null);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
