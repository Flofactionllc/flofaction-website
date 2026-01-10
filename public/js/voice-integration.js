/**
 * FLO FACTION VOICE INTEGRATION MODULE
 * Browser-compatible voice input/output using ElevenLabs & Web Speech API
 *
 * @version 1.0.0
 * @author Flo Faction LLC
 *
 * Usage:
 *   const voice = new FloFactionVoiceClient({ apiKey: 'your-key' });
 *   await voice.speak("Hello, welcome to Flo Faction!");
 *   voice.startListening((transcript) => console.log(transcript));
 */

(function(global) {
    'use strict';

    // ============================================
    // DEFAULT CONFIGURATION
    // ============================================
    const DEFAULT_CONFIG = {
        elevenLabsApiKey: null,
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - professional male
        modelId: 'eleven_monolingual_v1',
        stability: 0.5,
        similarityBoost: 0.75,
        language: 'en-US',
        useBrowserFallback: true,
        debug: false
    };

    // ============================================
    // ELEVENLABS VOICES
    // ============================================
    const VOICES = {
        adam: 'pNInz6obpgDQGcFmaJgB',      // Professional male
        bella: 'EXAVITQu4vr4xnSDxMaL',     // Friendly female
        arnold: 'VR6AewLTigWG4xSOukaG',   // Authoritative male
        elli: 'MF3mGyEYCl7XYWbV9V6O',      // Warm female
        josh: '21m00Tcm4TlvDq8ikWAM',      // Young male
        rachel: '21m00Tcm4TlvDq8ikWAM',    // Young female
        domi: 'AZnzlk1XvdvUeBnXmlld',      // Strong female
        sam: 'yoZ06aMxZJJ28mfd3POQ'        // Raspy male
    };

    // ============================================
    // MAIN VOICE CLIENT CLASS
    // ============================================
    class FloFactionVoiceClient {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.isListening = false;
            this.isSpeaking = false;
            this.recognition = null;
            this.audioQueue = [];
            this.currentAudio = null;

            // Callbacks
            this.onListeningStart = null;
            this.onListeningEnd = null;
            this.onTranscript = null;
            this.onInterimTranscript = null;
            this.onSpeakingStart = null;
            this.onSpeakingEnd = null;
            this.onError = null;

            this._initSpeechRecognition();
            this._log('FloFactionVoiceClient initialized');
        }

        // ============================================
        // SPEECH RECOGNITION (Voice Input)
        // ============================================

        _initSpeechRecognition() {
            const SpeechRecognition = global.SpeechRecognition || global.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                this._log('Speech Recognition not supported');
                return;
            }

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.config.language;

            this.recognition.onstart = () => {
                this.isListening = true;
                this._log('Listening started');
                this.onListeningStart?.();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this._log('Listening ended');
                this.onListeningEnd?.();
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    this._log('Final transcript:', finalTranscript);
                    this.onTranscript?.(finalTranscript);
                } else if (interimTranscript) {
                    this.onInterimTranscript?.(interimTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                this._log('Speech recognition error:', event.error);
                this.isListening = false;
                this.onError?.(event.error);
            };
        }

        /**
         * Start listening for voice input
         * @param {Function} callback - Called with final transcript
         * @returns {boolean} - Whether listening started successfully
         */
        startListening(callback) {
            if (!this.recognition) {
                this._log('Speech recognition not available');
                return false;
            }

            if (this.isListening) {
                return false;
            }

            if (callback) {
                this.onTranscript = callback;
            }

            try {
                this.recognition.start();
                return true;
            } catch (error) {
                this._log('Failed to start listening:', error);
                return false;
            }
        }

        /**
         * Stop listening for voice input
         */
        stopListening() {
            if (this.recognition && this.isListening) {
                this.recognition.stop();
            }
        }

        /**
         * Toggle listening on/off
         * @returns {boolean} - Current listening state
         */
        toggleListening() {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
            return this.isListening;
        }

        // ============================================
        // TEXT-TO-SPEECH (Voice Output)
        // ============================================

        /**
         * Speak text using ElevenLabs TTS (with browser fallback)
         * @param {string} text - Text to speak
         * @param {Object} options - Optional voice settings
         * @returns {Promise<boolean>} - Whether speech completed successfully
         */
        async speak(text, options = {}) {
            if (this.isSpeaking) {
                // Queue the audio
                this.audioQueue.push({ text, options });
                return true;
            }

            const cleanText = this._cleanText(text);
            if (!cleanText) return false;

            this.isSpeaking = true;
            this.onSpeakingStart?.();

            try {
                // Try ElevenLabs first
                if (this.config.elevenLabsApiKey) {
                    const audioUrl = await this._getElevenLabsAudio(cleanText, options);
                    if (audioUrl) {
                        await this._playAudio(audioUrl);
                        this._finishSpeaking();
                        return true;
                    }
                }

                // Fallback to browser speech synthesis
                if (this.config.useBrowserFallback) {
                    await this._browserSpeak(cleanText);
                    this._finishSpeaking();
                    return true;
                }

                this._finishSpeaking();
                return false;
            } catch (error) {
                this._log('Speech error:', error);

                // Try browser fallback on error
                if (this.config.useBrowserFallback) {
                    try {
                        await this._browserSpeak(cleanText);
                        this._finishSpeaking();
                        return true;
                    } catch (e) {
                        this._log('Browser fallback also failed:', e);
                    }
                }

                this._finishSpeaking();
                return false;
            }
        }

        _finishSpeaking() {
            this.isSpeaking = false;
            this.onSpeakingEnd?.();

            // Process queue
            if (this.audioQueue.length > 0) {
                const next = this.audioQueue.shift();
                this.speak(next.text, next.options);
            }
        }

        /**
         * Stop speaking
         */
        stopSpeaking() {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            if ('speechSynthesis' in global) {
                speechSynthesis.cancel();
            }

            this.audioQueue = [];
            this.isSpeaking = false;
            this.onSpeakingEnd?.();
        }

        /**
         * Get audio from ElevenLabs API
         */
        async _getElevenLabsAudio(text, options = {}) {
            const voiceId = options.voiceId || this.config.voiceId;

            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.config.elevenLabsApiKey
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: options.modelId || this.config.modelId,
                        voice_settings: {
                            stability: options.stability || this.config.stability,
                            similarity_boost: options.similarityBoost || this.config.similarityBoost
                        }
                    })
                });

                if (!response.ok) {
                    this._log('ElevenLabs API error:', response.status);
                    return null;
                }

                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                this._log('ElevenLabs error:', error);
                return null;
            }
        }

        /**
         * Play audio from URL
         */
        _playAudio(url) {
            return new Promise((resolve, reject) => {
                this.currentAudio = new Audio(url);

                this.currentAudio.onended = () => {
                    URL.revokeObjectURL(url);
                    this.currentAudio = null;
                    resolve();
                };

                this.currentAudio.onerror = (error) => {
                    URL.revokeObjectURL(url);
                    this.currentAudio = null;
                    reject(error);
                };

                this.currentAudio.play().catch(reject);
            });
        }

        /**
         * Browser speech synthesis fallback
         */
        _browserSpeak(text) {
            return new Promise((resolve) => {
                if (!('speechSynthesis' in global)) {
                    resolve();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = this.config.language;
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                // Get voices and try to find a good one
                const voices = speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google') ||
                    v.name.includes('Alex') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Microsoft')
                );
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                utterance.onend = resolve;
                utterance.onerror = resolve;

                speechSynthesis.speak(utterance);
            });
        }

        // ============================================
        // UTILITY METHODS
        // ============================================

        /**
         * Clean text for TTS (remove markdown, emojis, etc.)
         */
        _cleanText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
                .replace(/\n+/g, '. ')
                .replace(/•/g, ', ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 2000);
        }

        /**
         * Debug logging
         */
        _log(...args) {
            if (this.config.debug) {
                console.log('[FloFactionVoice]', ...args);
            }
        }

        /**
         * Set ElevenLabs API key
         */
        setApiKey(apiKey) {
            this.config.elevenLabsApiKey = apiKey;
        }

        /**
         * Set voice
         */
        setVoice(voiceId) {
            if (VOICES[voiceId]) {
                this.config.voiceId = VOICES[voiceId];
            } else {
                this.config.voiceId = voiceId;
            }
        }

        /**
         * Get capabilities
         */
        getCapabilities() {
            return {
                speechRecognition: !!this.recognition,
                speechSynthesis: 'speechSynthesis' in global,
                elevenLabs: !!this.config.elevenLabsApiKey,
                voices: VOICES
            };
        }

        /**
         * Get available browser voices
         */
        getBrowserVoices() {
            if (!('speechSynthesis' in global)) {
                return [];
            }
            return speechSynthesis.getVoices();
        }
    }

    // ============================================
    // CONVERSATIONAL AI HELPER
    // ============================================
    class ConversationalVoiceAgent {
        constructor(config = {}) {
            this.voice = new FloFactionVoiceClient(config);
            this.isActive = false;
            this.onUserMessage = null;
            this.onAgentResponse = null;
        }

        /**
         * Start conversational mode
         */
        start() {
            this.isActive = true;

            this.voice.onTranscript = async (transcript) => {
                this.onUserMessage?.(transcript);

                // Get response (to be connected to your AI backend)
                const response = await this.getResponse(transcript);

                if (response) {
                    this.onAgentResponse?.(response);
                    await this.voice.speak(response);
                }

                // Continue listening if still active
                if (this.isActive) {
                    setTimeout(() => this.voice.startListening(), 500);
                }
            };

            this.voice.startListening();
        }

        /**
         * Stop conversational mode
         */
        stop() {
            this.isActive = false;
            this.voice.stopListening();
            this.voice.stopSpeaking();
        }

        /**
         * Get response from AI (override this method to connect to your backend)
         */
        async getResponse(message) {
            // Default implementation - override with your AI backend
            return `I heard you say: "${message}". Connect me to your AI backend for real responses!`;
        }
    }

    // ============================================
    // EXPORTS
    // ============================================
    global.FloFactionVoiceClient = FloFactionVoiceClient;
    global.ConversationalVoiceAgent = ConversationalVoiceAgent;
    global.ELEVENLABS_VOICES = VOICES;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define('FloFactionVoice', [], function() {
            return { FloFactionVoiceClient, ConversationalVoiceAgent, VOICES };
        });
    }

    // CommonJS support
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { FloFactionVoiceClient, ConversationalVoiceAgent, VOICES };
    }

})(typeof window !== 'undefined' ? window : this);
