import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import Loader from "@/assets/images/logo/logo.png";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />
    );
  }
);

const DocTypeListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(null);

  const handleDeleteDocType = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/document-types/delete/${id}`,
        { headers: { Authorization: `${token}` } }
      );
      toast.success("Document Type deleted successfully");
      setDocTypes((prev) => prev.filter((d) => d._id !== id));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting document type:", error);
      toast.error("Failed to delete document type");
    }
  };


  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-doc-type/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-doc-type/${row._id}`, { state: { mode: "view" } });
    }
    // if (action === "delete") {
    //   try {
    //     const token = localStorage.getItem("token");
    //     await axios.delete(
    //       `${import.meta.env.VITE_APP_BASE_URL}/document-types/delete/${row._id}`,
    //       { headers: { Authorization: `${token}` } }
    //     );
    //     toast.success("DocType deleted successfully");
    //     setDocTypes((prev) => prev.filter((d) => d._id !== row._id));
    //     // refetch data after delete
    //     fetchDocTypes();
    //   } catch (err) {
    //     console.error("Error deleting doc type:", err);
    //   }
    // }
  };

  const fetchDocTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/document-types/GetAll?page=${page}&limit=${limit}`,
        { headers: { Authorization: `${token}` } }
      );

      const { data, pagination } = res.data || {};
      if (Array.isArray(data)) {
        setDocTypes(data);
      } else {
        setDocTypes([]);
      }

      if (pagination) {
        setTotal(pagination.total || 0);
        setPage(pagination.page || 1);
        setLimit(pagination.limit || 10);
        setTotalPages(pagination.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      setDocTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocTypes();
  }, [page, limit]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{row.row.index + 1 + (page - 1) * limit}</span>
        ),
      },
      { Header: "Type", accessor: "documentType" },
      { Header: "Abbreviation", accessor: "documentAbbreviation" },
      { Header: "Description", accessor: "description" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) =>
          row.value ? new Date(row.value).toLocaleDateString("en-GB") : "-",
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("view", row.original)}
            >
              <Icon icon="heroicons:eye" />
            </button>
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("edit", row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
            </button>
              <button
                className="action-btn"
                onClick={() => {
                  setSelectedDocTypeId(row.original._id);
                  setDeleteModalOpen(true); // open modal
                }}
              >
                <Icon icon="heroicons:trash" className="text-red-600"/>
              </button>
          </div>
        ),
      },
    ],
    [page, limit]
  );

  const data = useMemo(() => docTypes, [docTypes]);

  const tableInstance = useTable(
    { columns: COLUMNS, data },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: tablePage,
    prepareRow,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter } = state;

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Document Types</h4>
          <div className="flex items-center gap-3">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text={
                <>
                  <span className="hidden sm:inline">+ Create Doc Type</span>
                  <span className="inline sm:hidden">+ Create</span>
                </>
              }
              className="btn-primary py-2 px-3"
              type="button"
              onClick={() => navigate("/add-doc-type/add")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="border-t border-slate-100 dark:border-slate-800">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="table-th"
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="text-left">
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="py-10">
                        <div className="flex justify-center items-center">
                          <img
                            src={Loader}
                            alt="Loading..."
                            className="w-100 h-32"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : tablePage.length > 0 ? (
                    tablePage.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} className="table-td border-b">
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="py-6 text-gray-500">
                        No document types found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* Go to page */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 rtl:space-x-reverse items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Go</span>
              <span>
                <input
                  type="number"
                  className="form-control py-2"
                  value={page}
                  min={1}
                  max={totalPages}
                  onChange={(e) => {
                    const pageNumber = e.target.value ? Number(e.target.value) : 1;
                    setPage(Math.min(Math.max(pageNumber, 1), totalPages));
                  }}
                  style={{ width: "50px" }}
                />
              </span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page <span>{page}</span> of {totalPages}
            </span>
          </div>

          {/* Page numbers and navigation */}
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* First Page */}
            <li className="text-xl text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Previous */}
            <li>
              <button
                className={`px-3 py-1 bg-gray-200 rounded ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num}>
                <button
                  className={`text-sm rounded px-3 py-1 ${num === page
                    ? "bg-slate-900 text-white dark:bg-slate-600 dark:text-slate-200 font-medium"
                    : "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-400 font-normal"
                    }`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              </li>
            ))}

            {/* Next */}
            <li>
              <button
                className={`px-3 py-1 bg-gray-200 rounded ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </li>

            {/* Last Page */}
            <li className="text-xl text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* Page size selector */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="form-select py-2"
            >
              {[5, 10, 20, 30, 40].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Modal
        activeModal={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document Type"
       themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        footerContent={
          <div className="flex justify-between w-full">
            <Button
              text="Cancel"
              className="btn-light"
              onClick={() => setDeleteModalOpen(false)}
            />
            <Button
              text="Delete"
              className="btn-danger"
              onClick={async () => {
                await handleDeleteDocType(selectedDocTypeId);
              }}
            />
          </div>
        }
      >
        <p className="text-slate-700 dark:text-slate-300 ">
          Are you sure you want to delete this Document Type? This action cannot be undone.
        </p>
      </Modal>

    </div>
  );
};

export default DocTypeListing;
