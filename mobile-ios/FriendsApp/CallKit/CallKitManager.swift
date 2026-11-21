import Foundation
import CallKit

/**
 * iOS CallKit Manager
 * Integrates incoming calls natively into iOS lock-screen, Phone recents & CarPlay
 */
class CallKitManager: NSObject, CXProviderDelegate {
    private let provider: CXProvider
    private let callController = CXCallController()

    override init() {
        let configuration = CXProviderConfiguration()
        configuration.supportsVideo = true
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.generic]
        configuration.iconTemplateImageData = nil

        self.provider = CXProvider(configuration: configuration)
        super.init()
        self.provider.setDelegate(self, queue: nil)
    }

    func reportIncomingCall(uuid: UUID, callerName: String, hasVideo: Bool, completion: @escaping (Error?) -> Void) {
        let update = CXCallUpdate()
        update.remoteHandle = CXHandle(type: .generic, value: callerName)
        update.hasVideo = hasVideo
        update.localizedCallerName = callerName

        provider.reportNewIncomingCall(with: uuid, update: update) { error in
            completion(error)
        }
    }

    // CXProviderDelegate
    func providerDidReset(_ provider: CXProvider) {}

    func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        action.fulfill()
        // Notify WebRTC signaling that user accepted the call
    }

    func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        action.fulfill()
        // Hangup WebRTC call
    }
}
