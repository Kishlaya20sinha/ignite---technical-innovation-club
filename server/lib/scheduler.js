import cron from 'node-cron';
import Event from '../models/Event.js';
import EventRegistration from '../models/EventRegistration.js';
import SystemConfig from '../models/SystemConfig.js';
import ExamAllowlist from '../models/ExamAllowlist.js';
import { sendEmail } from './mailer.js';

const startScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const sixtyFiveMinsFromNow = new Date(now.getTime() + 65 * 60 * 1000);

        try {
            // 1. Check for Upcoming Events (standalone or mega sub-events)
            const upcomingEvents = await Event.find({
                date: { $gte: oneHourFromNow, $lte: sixtyFiveMinsFromNow },
                reminderSent: { $ne: true },
                isActive: true
            });

            for (const event of upcomingEvents) {
                const registrations = await EventRegistration.find({ eventId: event._id });
                for (const reg of registrations) {
                    await sendEmail(
                        reg.email,
                        `Reminder: ${event.name} starts in 1 hour!`,
                        `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #f97316;">Event Reminder</h2>
                            <p>Hello <strong>${reg.name}</strong>,</p>
                            <p>This is a reminder that <strong>${event.name}</strong> is starting in about an hour.</p>
                            <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                                <p style="margin: 0;"><strong>Time:</strong> ${new Date(event.date).toLocaleTimeString()}</p>
                                <p style="margin: 5px 0 0 0;"><strong>Venue:</strong> ${event.venue || 'TBA'}</p>
                            </div>
                            <p>See you there!</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #888;">IGNITE Technical Club</p>
                        </div>
                        `
                    );
                }
                event.reminderSent = true;
                await event.save();
                console.log(`[Scheduler] Sent reminders for event: ${event.name}`);
            }

            // 2. Check for Upcoming Exam (SystemConfig)
            const examTimes = await SystemConfig.findOne({ key: 'exam_times' });
            if (examTimes && examTimes.value?.startTime) {
                const startTime = new Date(examTimes.value.startTime);
                const diff = startTime.getTime() - now.getTime();
                
                // If start time is 1 hour away (55-65 mins range for robustness)
                if (diff > 55 * 60 * 1000 && diff < 65 * 60 * 1000) {
                    const reminderFlag = await SystemConfig.findOne({ key: 'exam_reminder_sent' });
                    if (!reminderFlag || reminderFlag.value !== true) {
                        const candidates = await ExamAllowlist.find({ canTakeExam: true });
                        for (const cand of candidates) {
                            await sendEmail(
                                cand.email,
                                `Exam Reminder: Technical Aptitude Test starts in 1 hour!`,
                                `
                                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                    <h2 style="color: #6366f1;">Exam Reminder</h2>
                                    <p>Hello <strong>${cand.name}</strong>,</p>
                                    <p>Your Technical Aptitude Test is scheduled to start in about 1 hour.</p>
                                    <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
                                        <p style="margin: 0;"><strong>Start Time:</strong> ${startTime.toLocaleTimeString()}</p>
                                        <p style="margin: 5px 0 0 0;"><strong>Portal:</strong> <a href="${process.env.FRONTEND_URL || 'https://igniteclub.in'}/exam">igniteclub.in/exam</a></p>
                                    </div>
                                    <p>Best of luck!</p>
                                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                                    <p style="font-size: 12px; color: #888;">IGNITE Technical Club</p>
                                </div>
                                `
                            );
                        }
                        await SystemConfig.findOneAndUpdate(
                            { key: 'exam_reminder_sent' },
                            { key: 'exam_reminder_sent', value: true, lastUpdated: new Date() },
                            { upsert: true }
                        );
                        console.log(`[Scheduler] Sent reminders for Exam`);
                    }
                }
            }

        } catch (err) {
            console.error('[Scheduler Error]', err);
        }
    });

    console.log('[Scheduler] Background service started.');
};

export default startScheduler;
