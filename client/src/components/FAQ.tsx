import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is geotagging and why is it important?",
    answer:
      "Geotagging adds geographical information (latitude and longitude) to your image's EXIF metadata. This helps with image organization, improves SEO by providing location context, and makes images searchable by location.",
  },
  {
    question: "Which image formats are supported?",
    answer:
      "We support JPG/JPEG, PNG, WebP, and HEIC formats. JPG is recommended as it has the most standardized support for geotags across all platforms and tools.",
  },
  {
    question: "How can I verify the geotags were added?",
    answer:
      "After processing, you can re-upload your image to see the coordinates displayed on the map. You can also use EXIF viewers or photo management software to check the GPS data.",
  },
  {
    question: "What are keywords and descriptions used for?",
    answer:
      "Keywords and descriptions improve image searchability and SEO. Keywords should be comma-separated terms (max 6,600 chars), while descriptions should clearly describe the image content (max 1,300 chars), similar to HTML alt tags.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-semibold text-center mb-8" data-testid="text-faq-title">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} data-testid={`accordion-item-${index}`}>
              <AccordionTrigger data-testid={`accordion-trigger-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent data-testid={`accordion-content-${index}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
