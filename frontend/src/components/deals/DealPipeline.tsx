import type {
  Deal,
  DealStage,
} from "../../types/crm";

import {
  formatCurrency,
} from "../../lib/crm";


const stages: {
  value: DealStage;
  label: string;
}[] = [
  { value: "lead", label: "Lead" },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "proposal",
    label: "Proposal",
  },
  {
    value: "negotiation",
    label: "Negotiation",
  },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];


type Props = {
  deals: Deal[];

  onStageChange: (
    deal: Deal,
    stage: DealStage,
  ) => void;

  onOpen: (
    deal: Deal,
  ) => void;
};


export default function DealPipeline({
  deals,
  onStageChange,
  onOpen,
}: Props) {
  return (
    <div className="deal-pipeline">
      {stages.map((stage) => {
        const stageDeals =
          deals.filter(
            (deal) =>
              deal.stage ===
              stage.value,
          );

        const total =
          stageDeals.reduce(
            (sum, deal) =>
              sum +
              Number(
                deal.amount ?? 0,
              ),
            0,
          );

        return (
          <section
            className="pipeline-column"
            key={stage.value}
          >
            <div className="pipeline-column-header">
              <div>
                <strong>
                  {stage.label}
                </strong>

                <span>
                  {stageDeals.length}
                </span>
              </div>

              <small>
                {formatCurrency(
                  total,
                )}
              </small>
            </div>


            <div className="pipeline-deals">
              {stageDeals.length ? (
                stageDeals.map(
                  (deal) => (
                    <article
                      className="pipeline-deal-card"
                      key={deal.id}
                    >
                      <button
                        type="button"
                        className="pipeline-deal-name"
                        onClick={() =>
                          onOpen(deal)
                        }
                      >
                        {deal.name}
                      </button>

                      <strong>
                        {formatCurrency(
                          deal.amount,
                        )}
                      </strong>

                      <span>
                        {deal.probability ===
                        null
                          ? "No probability"
                          : `${deal.probability}% probability`}
                      </span>

                      <select
                        value={
                          deal.stage
                        }
                        onChange={(
                          event,
                        ) =>
                          onStageChange(
                            deal,
                            event.target
                              .value as DealStage,
                          )
                        }
                      >
                        {stages.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </article>
                  ),
                )
              ) : (
                <div className="pipeline-empty">
                  No deals
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}