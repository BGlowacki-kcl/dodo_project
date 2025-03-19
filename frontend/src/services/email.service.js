const sendEmail = async (emailData, setStatus, showNotification, setFormData) => {
    try {
        setStatus('sending');
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        showNotification('Message sent successfully!', 'success');
      } catch (error) {
        console.error('Error sending email:', error);
        setStatus('error');
        showNotification('Something went wrong. Please try again later.', 'error');
      }
}

export default sendEmail;