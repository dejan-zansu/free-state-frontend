import type { AdminReference, AdminReferenceTranslation } from '@/types/admin'
import {
  REFERENCE_CONTAINER,
  REFERENCE_SPLIT_GRID,
  referenceInitials,
} from './reference-utils'

interface Props {
  reference: AdminReference
  translation: AdminReferenceTranslation
}

const ReferenceQuote = ({ reference, translation }: Props) => {
  if (!translation.quoteText) return null

  const authorName = reference.quoteAuthorName
  const initials = authorName ? referenceInitials(authorName) : ''

  return (
    <section className="bg-[#F3FFDD] py-16 lg:py-24">
      <div className={REFERENCE_CONTAINER}>
        <div className={REFERENCE_SPLIT_GRID}>
          <div className="mb-6 lg:mb-0">
            <svg
              width="41"
              height="25"
              viewBox="0 0 41 25"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 0h13l-5 25H0z" fill="#B7FE1A" />
              <path d="M28 0h13l-5 25H23z" fill="#B7FE1A" />
            </svg>
          </div>

          <div>
            <blockquote className="max-w-[670px] text-[22px] leading-[34px] text-[#062E25] lg:text-[29px] lg:leading-[44px]">
              {translation.quoteText}
            </blockquote>

            {authorName && (
              <div className="mt-10 flex items-center gap-4">
                <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#062E25] text-[14px] font-bold text-[#B7FE1A]">
                  {initials}
                </span>
                <div>
                  <p className="text-[15px] font-bold text-[#062E25]">
                    {authorName}
                  </p>
                  {translation.quoteAuthorRole && (
                    <p className="mt-1.5 text-[13px] text-[#7C918C]">
                      {translation.quoteAuthorRole}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReferenceQuote
