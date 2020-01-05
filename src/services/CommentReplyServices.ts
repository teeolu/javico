/**
 * @classdesc This service enhances the Api to carry out reply based operations
 */
import Api from '../utils/ApiConnector';

interface IPayload {
  data?: {
    commentId: string;
    author: {
      name: string;
      photoURL: string;
    };
    codeReference?: string;
    reply: string;
  };
  params: {
    ID?: string;
    sourceCodeID: string;
    commentID: string;
    limit?: number;
    after?: any;
  };
}

export default class CommentReplyService {
  static createReply = (payload: IPayload): Promise<any> => {
    const { params, data } = payload;
    return Api.firestore
      .collection(`source-codes/${params.sourceCodeID}/comments/${params.commentID}/replies`)
      .add({ ...data, createdAt: Api.app.firestore.FieldValue.serverTimestamp() });
  };

  static deleteReply = (payload: IPayload): Promise<any> => {
    const { params } = payload;
    return Api.firestore
      .collection(`source-codes/${params.sourceCodeID}/comments/${params.commentID}/replies`)
      .doc(params.ID)
      .delete();
  };

  static updateReply = (payload: any): Promise<any> => {
    const { params, data } = payload;
    return Api.firestore
      .collection(`source-codes/${params.sourceCodeID}/comments/${params.commentID}/replies`)
      .doc(params.ID)
      .set({ ...data, updatedAt: Api.app.firestore.FieldValue.serverTimestamp() }, { merge: true });
  };

  static fetchMoreReply = (payload: IPayload): Promise<any> => {
    const { params } = payload;
    return Api.firestore
      .collection(`source-codes/${params.sourceCodeID}/comment/${params.commentID}/replies`)
      .orderBy('createdAt', 'desc')
      .startAfter(params.after)
      .limit(params.limit)
      .get();
  };

  static onSnapshotChanged = (
    payload: IPayload,
    handleDataChanged: Function,
    handleError: Function,
  ) => {
    //This static method returns the replies in descending order during initial load then listens to any addition or updates to the colletion or documents in the collection
    const { params } = payload;
    Api.firestore
      .collection(`source-codes/${params.sourceCodeID}/comments/${params.commentID}/replies`)
      .orderBy('createdAt', 'desc')
      .limit(params.limit)
      .onSnapshot(handleDataChanged, handleError);
  };
}
