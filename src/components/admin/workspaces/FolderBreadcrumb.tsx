import { Fragment } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface FolderBreadcrumbProps {
  workspaceName: string
  breadcrumb: { id: string; name: string; isRestricted: boolean }[]
  onNavigate: (folderId: string | null) => void
}

export function FolderBreadcrumb({
  workspaceName,
  breadcrumb,
  onNavigate,
}: FolderBreadcrumbProps) {
  const ancestors = breadcrumb.slice(0, -1)
  const current = breadcrumb[breadcrumb.length - 1]

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap text-sm">
        <BreadcrumbItem>
          {breadcrumb.length === 0 ? (
            <BreadcrumbPage className="text-sm font-medium text-[#062E25]">
              {workspaceName}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={() => onNavigate(null)}
                className="text-sm text-[#062E25]/75 hover:text-[#062E25]"
              >
                {workspaceName}
              </button>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {ancestors.map(ancestor => (
          <Fragment key={ancestor.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  type="button"
                  onClick={() => onNavigate(ancestor.id)}
                  className="text-sm text-[#062E25]/75 hover:text-[#062E25]"
                >
                  {ancestor.name}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        {current && (
          <Fragment>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-[#062E25]">
                {current.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
