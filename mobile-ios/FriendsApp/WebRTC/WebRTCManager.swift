import Foundation
import WebRTC

/**
 * Native iOS WebRTC Manager Architecture
 * Handles RTCPeerConnection, Local Audio/Video Tracks, and SDP Signaling
 */
class WebRTCManager: NSObject {
    private let factory: RTCPeerConnectionFactory
    private var peerConnection: RTCPeerConnection?
    private var localAudioTrack: RTCAudioTrack?
    private var localVideoTrack: RTCVideoTrack?

    override init() {
        RTCInitializeSSL()
        let videoEncoderFactory = RTCDefaultVideoEncoderFactory()
        let videoDecoderFactory = RTCDefaultVideoDecoderFactory()
        self.factory = RTCPeerConnectionFactory(
            encoderFactory: videoEncoderFactory,
            decoderFactory: videoDecoderFactory
        )
        super.init()
    }

    func setupLocalAudio() {
        let audioConstraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        let audioSource = factory.audioSource(with: audioConstraints)
        self.localAudioTrack = factory.audioTrack(with: audioSource, trackId: "audio0")
    }

    func toggleMute(isMuted: Bool) {
        localAudioTrack?.isEnabled = !isMuted
    }

    func toggleCamera(isEnabled: Bool) {
        localVideoTrack?.isEnabled = isEnabled
    }

    func close() {
        peerConnection?.close()
        peerConnection = nil
    }
}
