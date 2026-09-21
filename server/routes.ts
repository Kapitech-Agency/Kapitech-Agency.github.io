    ? await postgresNotificationRepository.list()
    : getDatabase().notifications || [];

  const notifications = source.filter((notification) => {
    const typeAllowed =
      notification.type === 'finance' ? canViewFinance :
      notification.type === 'lead' ? canViewCrm :
      notification.type === 'approval' ? canViewApprovals :
      true;
    const recipientAllowed = !notification.recipientUserId || notification.recipientUserId === req.user!.id;
    return typeAllowed && recipientAllowed;
  }).map((notification) => ({
    ...notification,
    read: Array.isArray(notification.readBy)
      ? notification.readBy.includes(req.user!.id)
      : Boolean(notification.read)
  }));

  res.json({ success: true, notifications });
});

apiRouter.post('/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (getDataSourceMode() === 'postgres') {
    const notification = await postgresNotificationRepository.findById(id);
    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }
    if (notification.recipientUserId && notification.recipientUserId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Notification access denied.' });
      return;
    }
    const updated = await postgresNotificationRepository.markRead(id, req.user!.id);
    if (!updated) {
      res.status(403).json({ success: false, error: 'Notification access denied.' });
      return;
    }
    recordAuditLog({
      action: 'NOTIFICATION_READ',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Marked notification "${id}" as read.`,
      severity: 'info'
    });
    res.json({ success: true });
    return;
  }

  const db = getDatabase();
  const notif = (db.notifications || []).find(n => n.id === id);
  if (!notif) {
    res.status(404).json({ success: false, error: 'Notification not found.' });
    return;
  }
  if (notif.recipientUserId && notif.recipientUserId !== req.user!.id) {
    res.status(403).json({ success: false, error: 'Notification access denied.' });
    return;
  }
  if (!Array.isArray(notif.readBy)) notif.readBy = [];
  if (!notif.readBy.includes(req.user!.id)) notif.readBy.push(req.user!.id);
  saveDatabase(db);
  recordAuditLog({
    action: 'NOTIFICATION_READ',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Marked notification "${id}" as read.`,
    severity: 'info'
  });
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (getDataSourceMode() === 'postgres') {
    await postgresNotificationRepository.markAllRead(req.user!.id);
    recordAuditLog({
      action: 'NOTIFICATIONS_MARKED_ALL_READ',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Marked all accessible notifications as read.',
      severity: 'info'
    });
    res.json({ success: true });
    return;
  }

  const db = getDatabase();
  for (const notification of (db.notifications || [])) {
    if (notification.recipientUserId && notification.recipientUserId !== req.user!.id) continue;
    if (!Array.isArray(notification.readBy)) notification.readBy = [];
    if (!notification.readBy.includes(req.user!.id)) notification.readBy.push(req.user!.id);
  }