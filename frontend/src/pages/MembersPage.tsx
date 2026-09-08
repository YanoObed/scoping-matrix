import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  FormEventHandler,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";

import {
  apiRequest,
} from "../lib/api";


type Role =
  | "owner"
  | "admin"
  | "member";


type Member = {
  id: string;
  user_id: string;
  workspace_id: string;
  role: Role;

  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};


function displayName(
  member: Member,
) {
  return (
    [
      member.first_name,
      member.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    member.email
  );
}


function roleLabel(
  role: Role,
) {
  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
}


export default function MembersPage() {
  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const [
    members,
    setMembers,
  ] = useState<Member[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    role,
    setRole,
  ] = useState<
    "admin" | "member"
  >("member");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");


  const isOwner =
    workspace.role === "owner";

  const canManage =
    workspace.role === "owner" ||
    workspace.role === "admin";


  const loadMembers =
    useCallback(
      async () => {
        if (!canManage) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const data =
            await apiRequest<
              Member[]
            >(
              `/workspaces/${workspace.workspace_id}/members`,
            );

          setMembers(data);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load members",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        canManage,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);


  function openAddMember() {
    setEmail("");
    setRole("member");
    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
  }


  const handleAdd:
    FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setFormError("");

      try {
        await apiRequest<Member>(
          `/workspaces/${workspace.workspace_id}/members`,
          {
            method: "POST",

            body: JSON.stringify({
              email:
                email.trim(),
              role,
            }),
          },
        );

        setModalOpen(false);

        await loadMembers();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to add member",
        );
      } finally {
        setSaving(false);
      }
    };


  async function changeRole(
    member: Member,
    newRole:
      | "admin"
      | "member",
  ) {
    try {
      await apiRequest<Member>(
        `/workspaces/${workspace.workspace_id}/members/${member.id}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            role: newRole,
          }),
        },
      );

      await loadMembers();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to change role",
      );
    }
  }


  async function removeMember(
    member: Member,
  ) {
    const confirmed =
      window.confirm(
        `Remove "${displayName(member)}" from this workspace?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<void>(
        `/workspaces/${workspace.workspace_id}/members/${member.id}`,
        {
          method: "DELETE",
        },
      );

      await loadMembers();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to remove member",
      );
    }
  }


  if (!canManage) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1>
              Workspace Members
            </h1>

            <p>
              Manage workspace access
              and roles.
            </p>
          </div>
        </div>

        <section className="card placeholder-card">
          You do not have permission
          to manage workspace members.
        </section>
      </>
    );
  }


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Workspace Members
          </h1>

          <p>
            Manage access to{" "}
            <strong>
              {
                workspace.workspace_name
              }
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddMember}
        >
          + Add Member
        </button>
      </div>


      <section className="card">
        {error && (
          <div className="data-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="placeholder-card">
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              M
            </div>

            <h2>
              No members found
            </h2>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>
                    Member
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    CRM Access
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map(
                  (member) => {
                    const isCurrent =
                      member.id ===
                      workspace.membership_id;

                    const canRemove =
                      member.role !==
                        "owner" &&
                      (
                        isOwner ||
                        member.role ===
                          "member"
                      );

                    return (
                      <tr
                        key={member.id}
                      >
                        <td>
                          <div className="company-name-cell">
                            <div className="company-initial">
                              {displayName(
                                member,
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {displayName(
                                  member,
                                )}
                              </strong>

                              {isCurrent && (
                                <span>
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>


                        <td>
                          {member.email}
                        </td>


                        <td>
                          {member.phone ||
                            "—"}
                        </td>


                        <td>
                          {isOwner &&
                          member.role !==
                            "owner" ? (
                            <select
                              className="member-role-select"
                              value={
                                member.role
                              }
                              onChange={(event) =>
                                void changeRole(
                                  member,
                                  event
                                    .target
                                    .value as
                                    | "admin"
                                    | "member",
                                )
                              }
                            >
                              <option value="member">
                                Member
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>
                          ) : (
                            <span
                              className={
                                `member-role role-${member.role}`
                              }
                            >
                              {roleLabel(
                                member.role,
                              )}
                            </span>
                          )}
                        </td>


                        <td>
                          {member.role ===
                          "member"
                            ? "Assigned records only"
                            : "All workspace records"}
                        </td>


                        <td>
                          {canRemove ? (
                            <button
                              type="button"
                              className="table-delete-button"
                              onClick={() =>
                                void removeMember(
                                  member,
                                )
                              }
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="member-protected">
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="company-modal member-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div>
                <h2>
                  Add Workspace Member
                </h2>

                <p>
                  The user must already
                  have a Scoping Matrix
                  account.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={saving}
                onClick={closeModal}
              >
                ×
              </button>
            </div>


            <form
              className="company-form"
              onSubmit={handleAdd}
            >
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}


              <label>
                Email address *

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                />
              </label>


              <label>
                Role

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target
                        .value as
                        | "admin"
                        | "member",
                    )
                  }
                >
                  <option value="member">
                    Member
                  </option>

                  {isOwner && (
                    <option value="admin">
                      Admin
                    </option>
                  )}
                </select>
              </label>


              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Adding..."
                    : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}