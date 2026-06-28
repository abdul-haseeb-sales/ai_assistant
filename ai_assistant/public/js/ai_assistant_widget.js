$(document).ready(function() {
    // Only load if user is logged in
    if (frappe.session.user === "Guest") return;

    // Inject HTML for the chat widget
    const chatWidgetHTML = `
        <div id="ai-assistant-widget">
            <div id="ai-assistant-btn" class="ai-assistant-btn-circle">
                <i class="fa fa-comment"></i>
            </div>
            <div id="ai-assistant-chat-box" class="ai-assistant-chat-hidden">
                <div class="ai-assistant-chat-header">
                    <span>AI Assistant</span>
                    <button id="ai-assistant-close-btn">&times;</button>
                </div>
                <div id="ai-assistant-chat-body">
                    <div class="ai-assistant-message ai-assistant-bot-message">
                        Hello! I am AI Assistant. I can help you search ERPNext database and find files. How can I assist you today?
                    </div>
                </div>
                <div class="ai-assistant-chat-input-area">
                    <input type="text" id="ai-assistant-input" placeholder="Type your message..." />
                    <button id="ai-assistant-send-btn"><i class="fa fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    $('body').append(chatWidgetHTML);

    // Toggle Chat Box
    $('#ai-assistant-btn, #ai-assistant-close-btn').click(function() {
        $('#ai-assistant-chat-box').toggleClass('ai-assistant-chat-hidden');
    });

    // Send Message on Button Click
    $('#ai-assistant-send-btn').click(function() {
        sendMessage();
    });

    // Send Message on Enter Key
    $('#ai-assistant-input').keypress(function(e) {
        if (e.which == 13) {
            sendMessage();
        }
    });

    function sendMessage() {
        const inputField = $('#ai-assistant-input');
        const message = inputField.val().trim();
        if (!message) return;

        // Append User Message
        appendMessage(message, 'user');
        inputField.val('');

        // Append Typing Indicator
        const typingId = appendTypingIndicator();

        // Call Frappe API (renamed path to ai_assistant.api)
        frappe.call({
            method: "ai_assistant.api.chat_with_gemini",
            args: {
                message: message
            },
            callback: function(r) {
                removeTypingIndicator(typingId);
                if (!r.exc && r.message && r.message.status === 'success') {
                    let replyText = r.message.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    appendMessage(replyText, 'bot');
                } else {
                    let errorMsg = r.message ? r.message.message : "Something went wrong.";
                    appendMessage("Error: " + errorMsg, 'bot', true);
                }
            }
        });
    }

    function appendMessage(text, sender, isError=false) {
        const chatBody = $('#ai-assistant-chat-body');
        const msgClass = sender === 'user' ? 'ai-assistant-user-message' : 'ai-assistant-bot-message';
        const errorStyle = isError ? 'style="color: red;"' : '';
        
        chatBody.append(`<div class="ai-assistant-message ${msgClass}" ${errorStyle}>${text}</div>`);
        chatBody.scrollTop(chatBody[0].scrollHeight);
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        $('#ai-assistant-chat-body').append(`<div id="${id}" class="ai-assistant-message ai-assistant-bot-message"><em>AI Assistant is thinking...</em></div>`);
        return id;
    }

    function removeTypingIndicator(id) {
        $(`#${id}`).remove();
    }
});
