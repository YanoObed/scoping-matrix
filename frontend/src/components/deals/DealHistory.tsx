
import type {
  Deal,
  DealStage,
  DealStageHistory,
  WorkspaceMember,
} from "../../types/crm";

import {
  formatDateTime,
  memberName,
} from "../../lib/crm";

import Modal from "../ui/Modal";


type Props = {
  deal: Deal;
  history: DealStageHistory[];
  members: WorkspaceMember[];
  loading: boolean;
  error: string;
  onClose: () => void;
};


function stageLabel(
  stage: DealStage,
) {
  return (
    stage.charAt(0).toUpperCase() +
    stage.slice(1)
  );
}


export default function DealHistory({
  deal,
  history,
  members,
  loading,
  error,
  onClose,
}: Props) {
  const memberNames =
    new Map(
      members.map(
        (member) => [
          member.id,
          memberName(member),
        ],
      ),
    );


  return (
    <Modal
      title="Stage History"
      description={deal.name}
      className="history-modal"
      onClose={onClose}
    >
      <div className="history-content">
        {loading ? (
          <div className="placeholder-card">
            Loading history...
          </div>
        ) : error ? (
          <div className="form-error">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history">
            No stage changes recorded.
          </div>
        ) : (
          <div className="stage-history-list">
            {history.map(
              (item) => (
                <div
                  className="stage-history-item"
                  key={item.id}
                >
                  <div className="history-marker" />

                  <div>
                    <div className="history-stage-change">
                      <span
                        className={
                          `deal-stage-badge stage-${item.from_stage}`
                        }
                      >
                        {stageLabel(
                          item.from_stage,
                        )}
                      </span>

                      <strong>
                        →
                      </strong>

                      <span
                        className={
                          `deal-stage-badge stage-${item.to_stage}`
                        }
                      >
                        {stageLabel(
                          item.to_stage,
                        )}
                      </span>
                    </div>

                    <p>
                      Changed by{" "}
                      <strong>
                        {memberNames.get(
                          item.changed_by_membership_id,
                        ) ||
                          "Workspace member"}
                      </strong>
                    </p>

                    <time>
                      {formatDateTime(
                        item.created_at,
                      )}
                    </time>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}