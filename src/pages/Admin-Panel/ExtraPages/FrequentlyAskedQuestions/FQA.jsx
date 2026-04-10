import React, { useMemo, useState } from "react";
import { Transition } from "@headlessui/react";
import { IoIosArrowDown } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import AdminPanelLayout from "../../../../components/layout/AdminPanelLayout";

const faqs = [
  {
    question: "How do I register as a Ziyarat operator?",
    answer:
      "Use the registration flow, submit your company details, and include the routes, city stays, and holy sites you plan to offer for Iraq, Iran, or Iran-Iraq packages.",
  },
  {
    question: "What package types are supported in admin review?",
    answer:
      "The platform supports Iraq, Iran, and Iran-Iraq packages. The admin panel reviews these package types along with their pricing, hotel catalog usage, and publication status.",
  },
  {
    question: "How do I manage my listings?",
    answer:
      "Open the relevant module from the dashboard to update package details, hotel templates, featured status, and approval work queues.",
  },
  {
    question: "How are payments handled?",
    answer:
      "Payments are processed through the existing booking and finance flow. The admin panel only reviews and approves the submitted payment proofs.",
  },
  {
    question: "What should a compliant Ziyarat package include?",
    answer:
      "A compliant package should include the canonical package type, departure city, travel mode, city stays, holy sites, pricing, inclusions, exclusions, and date ranges.",
  },
];

const FQA = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = useMemo(
    () =>
      faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase().trim())
      ),
    [searchTerm]
  );

  return (
    <AdminPanelLayout
      title="Frequently Asked Questions"
      subtitle="Quick answers for common Ziyarat admin tasks."
      mainClassName="py-5 bg-gray-100"
    >
      <div className="bg-gray-100">
        <div className="mx-auto w-[90%] p-5 pb-11">
          <div className="mt-11 flex flex-col lg:flex-row">
            <div className="md:w-[65%]">
              <h1 className="mb-3 font-semibold text-[#484848] md:text-4xl text-lg leading-relaxed">
                Frequently asked <br className="hidden lg:inline" /> questions
              </h1>
              <p className="text-gray-600 md:text-base text-[11px]">
                Practical guidance for Ziyarat package operations and admin review.
              </p>
              <div className="my-5 flex items-center rounded-full border-2 bg-white px-3 py-2 shadow-sm md:w-72">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-grow rounded-l-full px-2 text-sm outline-none caret-[#00936C]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <AiOutlineSearch className="text-lg text-gray-500" />
              </div>
            </div>

            <div className="w-full mx-auto rounded-lg bg-white shadow-md md:p-7">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className={`py-4 ${index === filteredFaqs.length - 1 ? "" : "border-b border-b-[#c7c7c7]"}`}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left md:text-[15px] text-[10px] font-medium outline-none ${
                      openIndex === index ? "text-[#00936C]" : ""
                    }`}
                  >
                    {faq.question}
                    <span
                      className={`${openIndex === index ? "rotate-180" : "rotate-0"} transition-transform duration-500`}
                    >
                      <IoIosArrowDown />
                    </span>
                  </button>
                  <Transition
                    show={openIndex === index}
                    enter="transition ease-out duration-500"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition ease-in duration-500"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <p className="bg-white px-4 py-2 pb-7 text-gray-700">{faq.answer}</p>
                  </Transition>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default FQA;
