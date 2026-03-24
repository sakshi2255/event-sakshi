const pool = require("../../config/db");

const verifyTicket = async (req, res) => {
    const { token } = req.body;

    try {
        // 1. Find registration and join with user details for the staff to see
        const query = `
            SELECT r.id, r.attendance_status, r.event_id, u.full_name, u.email, e.title as event_title
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            WHERE r.ticket_token = $1
        `;
        const result = await pool.query(query, [token]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invalid Ticket: No registration found." });
        }

        const registration = result.rows[0];

        // 2. Check if already attended
        if (registration.attendance_status === 'attended') {
            return res.status(400).json({ 
                message: "Already Checked In", 
                user: registration 
            });
        }

        // 3. Mark as Attended
        await pool.query(
            "UPDATE registrations SET attendance_status = 'attended', attended_at = NOW() WHERE ticket_token = $1",
            [token]
        );

        res.status(200).json({
            message: "Check-in Successful!",
            user: {
                name: registration.full_name,
                email: registration.email,
                event: registration.event_title
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { verifyTicket };